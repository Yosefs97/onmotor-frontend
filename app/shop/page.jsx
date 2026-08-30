// /app/shop/page.jsx
export const dynamic = 'force-dynamic';

import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ShopHomepage from '@/components/ShopHomepage';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';
import { fetchHomepageProducts } from '@/lib/shop/fetchHomepageProducts';

export default async function ShopPage() {
  const [categories, products] = await Promise.all([
    fetchCategoryList(),
    fetchHomepageProducts(),
  ]);

  return (
    <ShopLayoutInternal categories={categories} hideSidebar={true} showInfo={false}>
      <ShopHomepage categories={categories} products={products} />
    </ShopLayoutInternal>
  );
}
