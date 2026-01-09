// /app/shop/page.jsx

export const dynamic = 'force-dynamic';

import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
import MainCategoriesGrid from '@/components/MainCategoriesGrid'; 
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs'; 
import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';
import { fetchMenu } from '@/lib/shopify/fetchMenu'; 

export default async function ShopPage() {
  const [manufacturers, categories, menuItems] = await Promise.all([
    fetchManufacturers(),
    fetchCategoryList(),
    fetchMenu('mega-menu-1') 
  ]);

  return (
    // 👇 העברנו את categories כ-prop ל-ShopLayoutInternal כדי שיגיע לסיידבר
    <ShopLayoutInternal menuItems={menuItems} categories={categories}>
      
      <div className="flex flex-col gap-2 md:gap-3">

        {/* פירורי לחם */}
        <div className="px-2 md:px-4 mt-1">
          <AutoShopBreadcrumbs />
        </div>

        {/* קו מפריד */}
        <div className="border-t border-gray-200 mx-4" />
        
        {/* אזור היצרנים */}
        <div className="w-full px-2 md:px-4">
          <h2 className="text-xl md:text-2xl font-bold mb-2 px-2 text-gray-800">
            איתור חלפים לפי יצרן
          </h2>
          <ManufacturerGrid manufacturers={manufacturers} />
        </div>
        
        {/* אזור הקטגוריות - ראשי */}
        {/* 👇 הוספנו md:hidden - זה יוסתר במחשב (כי במחשב זה עבר לסיידבר) ויופיע רק במובייל */}
        <div className="w-full px-2 md:px-0 mb-4 md:hidden">
           <MainCategoriesGrid categories={categories} />
        </div>

      </div>
      
    </ShopLayoutInternal>
  );
}