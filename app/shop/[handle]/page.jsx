import ProductPageInner from './ProductPageInner';
import { fetchProduct } from '@/lib/shop/fetchProduct';
import { fetchSearchResults } from '@/lib/shop/fetchSearch';

export const revalidate = 600;

export default async function ProductPage({ params, searchParams }) {
  // 👇👇👇 תיקון קריטי ל-Next.js 15: חובה לעשות await למשתנים האלה
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const handle = resolvedParams.handle;

  // 🔥 שימוש ב-resolvedSearchParams במקום searchParams הישן
  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );

  const isSearch = Object.keys(filters).length > 0;

  if (isSearch) {
    const items = await fetchSearchResults(filters);
    return <ProductPageInner type="search" items={items} />;
  }

  // מוצר יחיד
  const product = await fetchProduct(handle);

  return <ProductPageInner type="product" product={product} />;
}