// /app/shop/parts/page.jsx
export const dynamic = 'force-dynamic';

import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs'; 
import FeaturedProducts from '@/components/FeaturedProducts'; // יבוא הקומפוננטה שיצרנו

import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';
import { fetchMenu } from '@/lib/shopify/fetchMenu'; 

// 👇 הנה הייבוא הנכון שמצאנו!
import { fetchHomepageProducts } from '@/lib/shop/fetchHomepageProducts'; 

export default async function PartsPage() {
  // מושכים את כל הנתונים יחד (כולל המוצרים)
  const [manufacturers, categories, menuItems, products] = await Promise.all([
    fetchManufacturers(),
    fetchCategoryList(),
    fetchMenu('mega-menu-1'),
    fetchHomepageProducts() // 👈 קוראים לפונקציה האמיתית שלך
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
          {/* מנוע חיפוש היצרנים (הלוגואים) */}
          <ManufacturerGrid manufacturers={manufacturers} />
        </div>

        {/* 🌟 הוספנו כאן את הבלוק החדש 🌟 */}
        <div className="mt-12 w-full px-2 md:px-4">
          <FeaturedProducts 
            products={products || []} 
            targetTag="מבצע" // שנה את זה לתגית שתרצה לסנן לפיה
            title="מוצרים שכדאי להכיר עכשיו"
            subtitle="המלצות חמות"
            linkUrl="/shop"
            linkText="לכל המוצרים"
          />
        </div>

      </div>
    </ShopLayoutInternal>
  );
}