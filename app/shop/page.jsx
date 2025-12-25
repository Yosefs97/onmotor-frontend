// /app/shop/page.jsx

// 👇 1. פותר את שגיאת DYNAMIC_SERVER_USAGE
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
    <ShopLayoutInternal menuItems={menuItems}>
      
      {/* 👇 השינוי הגדול: עטפנו את הכל ב-div אחד עם flex-col ו-gap-2.
          זה מבטל את הריווח הגדול (space-y-6) של הלייאוט, ונותן לנו שליטה מלאה.
          gap-2 נותן רווח של 8px בלבד בין האלמנטים.
      */}
      <div className="flex flex-col gap-2 md:gap-3">

        {/* פירורי לחם */}
        <div className="px-2 md:px-4 mt-1">
          <AutoShopBreadcrumbs />
        </div>

        {/* קו מפריד - צמצמנו את המרווחים שלו למינימום */}
        <div className="border-t border-gray-200 mx-4" />
        
        {/* אזור היצרנים */}
        <div className="w-full px-2 md:px-4">
          {/* הקטנו את המרווח מתחת לכותרת מ-mb-4 ל-mb-2 */}
          <h2 className="text-xl md:text-2xl font-bold mb-2 px-2 text-gray-800">
            איתור חלפים לפי יצרן
          </h2>
          <ManufacturerGrid manufacturers={manufacturers} />
        </div>
        
        {/* קו מפריד נוסף (אופציונלי - אם תרצה הפרדה עדינה בין היצרנים לקטגוריות) */}
        {/* <div className="border-t border-gray-100 mx-6 my-1" /> */}

        {/* אזור הקטגוריות */}
        <div className="w-full px-2 md:px-0 mb-4">
           {/* הקטגוריות יופיעו מייד אחרי היצרנים בלי רווח ענק */}
           <MainCategoriesGrid categories={categories} />
        </div>

      </div>
      
    </ShopLayoutInternal>
  );
}