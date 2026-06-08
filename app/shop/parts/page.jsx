// /app/shop/parts/page.jsx
export const dynamic = 'force-dynamic';

import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs'; 
import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';
import { fetchMenu } from '@/lib/shopify/fetchMenu'; 

export default async function PartsPage() {
  const [manufacturers, categories, menuItems] = await Promise.all([
    fetchManufacturers(),
    fetchCategoryList(),
    fetchMenu('mega-menu-1') 
  ]);

  return (
    <ShopLayoutInternal menuItems={menuItems} categories={categories}>
      <div className="flex flex-col gap-2 md:gap-3">
        <div className="px-2 md:px-4 mt-1">
          <AutoShopBreadcrumbs />
        </div>

        <div className="border-t border-gray-200 mx-4" />
        
        <div className="w-full px-2 md:px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 px-2 text-gray-800">
            איתור חלפים לפי יצרן
          </h1>
          {/* מנוע חיפוש היצרנים (הלוגואים והגלילה שבתמונה) */}
          <ManufacturerGrid manufacturers={manufacturers} />
        </div>
      </div>
    </ShopLayoutInternal>
  );
}