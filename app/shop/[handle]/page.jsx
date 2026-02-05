import ProductPageInner from './ProductPageInner';
import { fetchProduct } from '@/lib/shop/fetchProduct';
import { fetchSearchResults } from '@/lib/shop/fetchSearch';
import { fetchCollectionStats } from '@/lib/shop/fetchCollectionStats'; 

export const revalidate = 600;

// --- תוספת Metadata עבור שיתוף תמונה ---
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await fetchProduct(resolvedParams.handle);

  if (!product) return { title: 'מוצר לא נמצא' };

  const shareImage = product.featuredImage?.url || product.images?.edges?.[0]?.node?.url;
  const cleanDescription = product.descriptionHtml 
    ? product.descriptionHtml.replace(/<[^>]*>?/gm, '').substring(0, 160) 
    : '';

  return {
    title: product.title,
    description: cleanDescription,
    openGraph: {
      title: product.title,
      description: cleanDescription,
      images: shareImage ? [{ url: shareImage }] : [],
      type: 'website',
    },
  };
}

export default async function ProductPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const handle = resolvedParams.handle;

  // --- לוגיקת חיפוש (ללא שינוי) ---
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
      return <div>Product not found</div>;
  }

  // 👇 לוגיקת שליפת הנתונים לסיידבר כפי ששלחת במקור 👇
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