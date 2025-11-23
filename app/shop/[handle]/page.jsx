// /app/shop/[handle]/page.jsx
import ProductPageInner from './ProductPageInner';
import { fetchProduct } from '@/lib/shop/fetchProduct';
import { fetchSearchResults } from '@/lib/shop/fetchSearch';

export const revalidate = 600; // 10 דקות קאש — מצוין למוצרים

export default async function ProductPage({ params, searchParams }) {
  const filters = searchParams;
  const handle = params.handle;

  // אם יש פילטרים → זה חיפוש ולא פרודקט יחיד
  const isSearch = Object.keys(filters).length > 0;

  if (isSearch) {
    const items = await fetchSearchResults(filters);
    return <ProductPageInner type="search" items={items} />;
  }

  // מוצר יחיד
  const product = await fetchProduct(handle);

  return <ProductPageInner type="product" product={product} />;
}
