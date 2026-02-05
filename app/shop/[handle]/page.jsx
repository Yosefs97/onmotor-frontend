//app\shop\[handle]\page.jsx

import ProductPageInner from './ProductPageInner';
import { fetchProduct } from '@/lib/shop/fetchProduct';
import { fetchSearchResults } from '@/lib/shop/fetchSearch';
import { fetchCollectionStats } from '@/lib/shop/fetchCollectionStats'; 

export const revalidate = 600;

// --- תוספת Metadata מעודכנת לפתרון בעיית ה-Redirect ---
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await fetchProduct(resolvedParams.handle);

  if (!product) return { title: 'מוצר לא נמצא' };

  // וודא כתובת מלאה לתמונה
  let shareImage = product.featuredImage?.url || product.images?.edges?.[0]?.node?.url;
  if (shareImage && shareImage.startsWith('//')) {
    shareImage = `https:${shareImage}`;
  }

  const cleanDescription = product.descriptionHtml 
    ? product.descriptionHtml.replace(/<[^>]*>?/gm, '').substring(0, 160) 
    : '';

  const pageUrl = `https://www.onmotormedia.com/shop/${resolvedParams.handle}`;

  return {
    title: product.title,
    description: cleanDescription,
    // קביעת ה-URL הקנוני מונעת מפייסבוק להפנות לדף הבית
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: product.title,
      description: cleanDescription,
      url: pageUrl, // מגדיר לרשתות החברתיות שזה העמוד המקורי
      siteName: 'OnMotor Media',
      images: shareImage ? [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: product.title,
        }
      ] : [],
      locale: 'he_IL',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: cleanDescription,
      images: shareImage ? [shareImage] : [],
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
      return <div className="p-10 text-center" dir="rtl">המוצר לא נמצא</div>;
  }

  // --- לוגיקת שליפת הנתונים לסיידבר ---
  let collectionStats = null;
  let collectionHandleToFetch = 'all'; 

  const categoryTag = product.tags?.find(t => t.startsWith('cat:'));

  if (categoryTag) {
    collectionHandleToFetch = categoryTag.replace('cat:', '').trim();
  }

  try {
    collectionStats = await fetchCollectionStats(collectionHandleToFetch);
    console.log(`Sidebar stats fetched for: ${collectionHandleToFetch}`, !!collectionStats);
  } catch (error) {
    console.error(`Error fetching stats for ${collectionHandleToFetch}:`, error);
  }

  if (!collectionStats && collectionHandleToFetch !== 'all') {
      try {
          console.log('Fetching fallback stats (all)...');
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