import ProductPageInner from './ProductPageInner';
import { fetchProduct } from '@/lib/shop/fetchProduct';
import { fetchSearchResults } from '@/lib/shop/fetchSearch';
// 👇 1. ייבוא הפונקציה לשליפת סטטיסטיקות קטגוריה (אני מניח שהיא קיימת או שניצור אותה)
import { fetchCollectionStats } from '@/lib/shop/fetchCollectionStats'; 

export const revalidate = 600;

export default async function ProductPage({ params, searchParams }) {
  // תיקון קריטי ל-Next.js 15: המתנה לפרמטרים
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const handle = resolvedParams.handle;

  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );

  const isSearch = Object.keys(filters).length > 0;

  // --- מצב חיפוש ---
  if (isSearch) {
    const items = await fetchSearchResults(filters);
    return <ProductPageInner type="search" items={items} />;
  }

  // --- מצב מוצר יחיד ---
  const product = await fetchProduct(handle);

  if (!product) {
      return <div>Product not found</div>; // טיפול בסיסי אם אין מוצר
  }

  // 👇👇👇 2. החלק החדש: הכנת נתונים לסיידבר האביזרים
  let collectionStats = null;

  // נחפש תגית שמתחילה ב-"cat:" (למשל cat:road)
  const categoryTag = product.tags?.find(t => t.startsWith('cat:'));

  if (categoryTag) {
    const collectionHandle = categoryTag.replace('cat:', '').trim();
    
    try {
      // שולפים את הנתונים (יצרנים, סוגים, תגיות) של הקולקציה הזו
      collectionStats = await fetchCollectionStats(collectionHandle);
    } catch (error) {
      console.error('Error fetching collection stats for sidebar:', error);
    }
  }
  // 👆👆👆 סוף החלק החדש

  return (
    <ProductPageInner 
      type="product" 
      product={product} 
      collectionStats={collectionStats} // 👈 חייבים להעביר את זה פנימה!
    />
  );
}