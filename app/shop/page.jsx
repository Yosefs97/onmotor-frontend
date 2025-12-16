// /app/shop/page.jsx
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
import MainCategoriesGrid from '@/components/MainCategoriesGrid'; 
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs'; 
import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';
// 👇 1. ייבוא הפונקציה לשליפת התפריט
import { fetchMenu } from '@/lib/shopify/fetchMenu'; 

export const revalidate = 600;

export default async function ShopPage() {
  // 👇 2. הוספת שליפת התפריט (רץ במקביל לשאר הבקשות לביצועים מהירים)
  const [manufacturers, categories, menuItems] = await Promise.all([
    fetchManufacturers(),
    fetchCategoryList(),
    fetchMenu('mega-menu') // וודא שה-handle בשופיפיי הוא mega-menu
  ]);

  return (
    // 👇 3. העברת הנתונים (menuItems) ל-Layout
    <ShopLayoutInternal menuItems={menuItems}>
      
      <div className="px-2 md:px-4 mt-2">
        <AutoShopBreadcrumbs />
      </div>

      <div className="border-t border-gray-200 my-1 mx-6" />
      
      <div className="w-full px-2 md:px-4">
        <h2 className="text-2xl font-bold mb-4 px-2 text-gray-800">איתור חלפים לפי יצרן</h2>
        <ManufacturerGrid manufacturers={manufacturers} />
      </div>
      
      <div className="w-full mt-1 mb-10 px-2 md:px-0">
        <MainCategoriesGrid categories={categories} />
      </div>
      
    </ShopLayoutInternal>
  );
}