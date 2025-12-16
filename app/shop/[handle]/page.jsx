// /app/shop/[handle]/page.jsx (או ProductPage.js)
import ProductPageInner from './ProductPageInner';
import { fetchProduct } from '@/lib/shop/fetchProduct';
import { fetchSearchResults } from '@/lib/shop/fetchSearch';
import { fetchCollectionStats } from '@/lib/shop/fetchCollectionStats'; 

export const revalidate = 600;

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

  // 👇👇👇 תיקון הלוגיקה לשליפת הנתונים לסיידבר 👇👇👇
  let collectionStats = null;
  let collectionHandleToFetch = 'all'; // ברירת מחדל: שליפת הכל

  // 1. ננסה למצוא תגית קטגוריה ספציפית
  const categoryTag = product.tags?.find(t => t.startsWith('cat:'));

  if (categoryTag) {
    collectionHandleToFetch = categoryTag.replace('cat:', '').trim();
  }

  try {
    // 2. ננסה לשלוף נתונים לקטגוריה שנמצאה
    collectionStats = await fetchCollectionStats(collectionHandleToFetch);
    
    // לוג דיבאג לשרת (תוכל לראות בטרמינל אם זה מצליח)
    console.log(`Sidebar stats fetched for: ${collectionHandleToFetch}`, !!collectionStats);

  } catch (error) {
    console.error(`Error fetching stats for ${collectionHandleToFetch}:`, error);
  }

  // 3. מנגנון Fallback: אם לא הצלחנו להביא נתונים (או שהמוצר לא משויך), נביא נתונים כלליים
  // זה מבטיח שהסיידבר לא יהיה ריק
  if (!collectionStats && collectionHandleToFetch !== 'all') {
      try {
          console.log('Fetching fallback stats (all)...');
          collectionStats = await fetchCollectionStats('all');
      } catch (e) {
          console.error('Fallback fetch failed:', e);
      }
  }
  // 👆👆👆 סוף התיקון

  return (
    <ProductPageInner 
      type="product" 
      product={product} 
      // אם עדיין null, הסיידבר יציג אלמנט ריק אך לא ישבור את העמוד
      collectionStats={collectionStats || { types: [], vendors: [], tags: [], handle: 'all' }} 
    />
  );
}