// app/shop/[handle]/page.jsx

import ProductPageInner from './ProductPageInner';
import { fetchProduct } from '@/lib/shop/fetchProduct';
import { fetchSearchResults } from '@/lib/shop/fetchSearch';
import { fetchCollectionStats } from '@/lib/shop/fetchCollectionStats'; 

export const revalidate = 600;

// --- פונקציית Metadata משופרת לשיתוף מושלם ---
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const handle = resolvedParams.handle;
  const product = await fetchProduct(handle);

  if (!product) return { title: 'מוצר לא נמצא' };

  // 1. טיפול בתמונה ואופטימיזציה לוואטסאפ (הקטנה ל-800px למניעת התעלמות בגלל משקל)
  let shareImage = product.featuredImage?.url || product.images?.edges?.[0]?.node?.url;
  if (shareImage) {
    if (shareImage.startsWith('//')) shareImage = `https:${shareImage}`;
    shareImage = shareImage.includes('?') ? `${shareImage}&width=800` : `${shareImage}?width=800`;
  } else {
    shareImage = 'https://www.onmotormedia.com/full_Logo_v2.jpg';
  }

  const cleanDescription = product.descriptionHtml 
    ? product.descriptionHtml.replace(/<[^>]*>?/gm, '').substring(0, 160) 
    : 'מוצר חדש במגזין OnMotor';

  // 2. נרמול ה-URL כדי למנוע שגיאות צד-לקוח באפליקציות (עקב תווים בעברית)
  const safeHandle = encodeURIComponent(decodeURIComponent(handle));
  const pageUrl = `/shop/${safeHandle}`;

  return {
    title: product.title,
    description: cleanDescription,
    // הוספת קנוניקל ספציפי למוצר כדי שפייסבוק לא תחזור לדף הבית
    alternates: {
      canonical: pageUrl,
    },
    other: {
      'fb:app_id': '1702134291174147', 
      'fb:pages': '1671844356419083',  
    },
    openGraph: {
      title: product.title,
      description: cleanDescription,
      url: pageUrl,
      siteName: 'OnMotor Media',
      type: 'website', 
      images: [
        {
          url: shareImage,
          width: 800,
          height: 600,
          alt: product.title,
        }
      ],
      locale: 'he_IL',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: cleanDescription,
      images: [shareImage],
    },
  };
}

export default async function ProductPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const handle = resolvedParams.handle;

  // --- לוגיקת חיפוש ---
  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );
  const isSearch = Object.keys(filters).length > 0;

  if (isSearch) {
    const items = await fetchSearchResults(filters);
    return <ProductPageInner type="search" items={items} />;
  }

  // --- שליפת מוצר ---
  const product = await fetchProduct(handle);

  if (!product) {
      return (
        <div className="min-h-screen flex items-center justify-center text-xl font-bold" dir="rtl">
          המוצר לא נמצא
        </div>
      );
  }

  // --- לוגיקת שליפת נתונים לסיידבר ---
  let collectionStats = null;
  let collectionHandleToFetch = 'all'; 

  const categoryTag = product.tags?.find(t => t.startsWith('cat:'));

  if (categoryTag) {
    collectionHandleToFetch = categoryTag.replace('cat:', '').trim();
  }

  try {
    collectionStats = await fetchCollectionStats(collectionHandleToFetch);
  } catch (error) {
    console.error(`Error fetching stats for ${collectionHandleToFetch}:`, error);
  }

  // Fallback אם לא נמצאו נתונים לקטגוריה הספציפית
  if (!collectionStats && collectionHandleToFetch !== 'all') {
      try {
          collectionStats = await fetchCollectionStats('all');
      } catch (e) {
          console.error('Fallback fetch failed:', e);
      }
  }

  return (
    <ProductPageInner 
      type="product" 
      product={product} 
      collectionStats={collectionStats || { types: [], vendors: [], tags: [], handle: 'all' }} 
    />
  );
}