// /app/shop/[handle]/page.jsx
import ProductPageInner from './ProductPageInner';
import { fetchProduct } from '@/lib/shop/fetchProduct';
import { fetchSearchResults } from '@/lib/shop/fetchSearch';

export const revalidate = 600;

export default async function ProductPage({ params, searchParams }) {
  const handle = params.handle;

  // 🔥 המרה של searchParams לאובייקט רגיל
  const filters = Object.fromEntries(
    Object.entries(searchParams || {}).map(([k, v]) => [k, String(v)])
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
