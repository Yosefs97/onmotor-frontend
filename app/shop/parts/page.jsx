// /app/shop/parts/page.jsx
export const dynamic = 'force-dynamic';

import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs'; 
import FeaturedProducts from '@/components/FeaturedProducts'; // יבוא בלוק המוצרים

import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';
import { fetchMenu } from '@/lib/shopify/fetchMenu'; 
// חשוב: ודא שהנתיב הזה תואם לפונקציית שליפת המוצרים בפרויקט שלך
import { fetchProducts } from '@/lib/shopify/fetchProducts'; // או נתיב רלוונטי אחר אצלך

export default async function PartsPage() {
  // הוספנו את שליפת המוצרים במקביל לשאר הבקשות כדי לא לפגוע במהירות
  const [manufacturers, categories, menuItems, products] = await Promise.all([
    fetchManufacturers(),
    fetchCategoryList(),
    fetchMenu('mega-menu-1'),
    fetchProducts({ limit: 50 }) // שלוף כמות מספקת של מוצרים כדי שיהיה ממה לסנן לפי תגית
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

        {/* שילוב בלוק המוצרים המומלצים/מבצעים מתחת ליצרנים */}
        <div className="mt-12 w-full px-2 md:px-4">
          <FeaturedProducts 
            products={products} 
            targetTag="מבצע" // התגית שלפיה המוצרים יסוננו
            title="מוצרים שכדאי להכיר עכשיו"
            subtitle="המלצות חמות"
            linkUrl="/shop" // לאן יפנה הקישור (התאם לפי הצורך)
            linkText="לכל המוצרים"
          />
        </div>

      </div>
    </ShopLayoutInternal>
  );
}