// app/shop/[handle]/page.jsx
import ProductPageInner from './ProductPageInner';
import { fetchProduct } from '@/lib/shop/fetchProduct';
import { fetchSearchResults } from '@/lib/shop/fetchSearch';
import { fetchCollectionStats } from '@/lib/shop/fetchCollectionStats'; 

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const handle = resolvedParams.handle;
  const product = await fetchProduct(handle);

  if (!product) return { title: 'מוצר לא נמצא' };

  // חילוץ תמונה עם Fallback ברור
  let shareImage = product.featuredImage?.url || product.images?.edges?.[0]?.node?.url;
  
  if (shareImage) {
    if (shareImage.startsWith('//')) shareImage = `https:${shareImage}`;
    // וואטסאפ ופייסבוק אוהבות תמונות עד 800px
    shareImage = shareImage.includes('?') ? `${shareImage}&width=800` : `${shareImage}?width=800`;
  } else {
    // אם אין תמונת מוצר, לפחות נשלח את הלוגו בצורה תקינה
    shareImage = 'https://www.onmotormedia.com/full_Logo_v2.jpg';
  }

  const cleanDescription = product.descriptionHtml 
    ? product.descriptionHtml.replace(/<[^>]*>?/gm, '').substring(0, 160) 
    : 'מוצר חדש במגזין OnMotor';

  const safeHandle = encodeURIComponent(decodeURIComponent(handle));
  const pageUrl = `https://www.onmotormedia.com/shop/${safeHandle}`;

  return {
    title: product.title,
    description: cleanDescription,
    other: {
      'fb:app_id': '1702134291174147', 
      'fb:pages': '1671844356419083',  
    },
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: product.title,
      description: cleanDescription,
      url: pageUrl,
      siteName: 'OnMotor Media',
      type: 'website', 
      images: [
        {
          url: shareImage, // מוודא שזה נשלח כמאפיין מפורש
          width: 800,
          height: 600,
          alt: product.title,
        },
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

// ... שאר הפונקציה ProductPage ללא שינוי ...
export default async function ProductPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const handle = resolvedParams.handle;

  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );
  if (Object.keys(filters).length > 0) {
    const items = await fetchSearchResults(filters);
    return <ProductPageInner type="search" items={items} />;
  }

  const product = await fetchProduct(handle);
  if (!product) return <div className="p-20 text-center">המוצר לא נמצא</div>;

  let collectionStats = null;
  let collectionHandleToFetch = 'all'; 
  const categoryTag = product.tags?.find(t => t.startsWith('cat:'));
  if (categoryTag) collectionHandleToFetch = categoryTag.replace('cat:', '').trim();

  try {
    collectionStats = await fetchCollectionStats(collectionHandleToFetch);
  } catch (error) {
    console.error(error);
  }

  return (
    <ProductPageInner 
      type="product" 
      product={product} 
      collectionStats={collectionStats || { types: [], vendors: [], tags: [], handle: 'all' }} 
    />
  );
}