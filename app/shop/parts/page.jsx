// /app/shop/parts/page.jsx
export const dynamic = 'force-dynamic';

import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs'; 
import FeaturedProducts from '@/components/FeaturedProducts'; 

import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';
import { fetchMenu } from '@/lib/shopify/fetchMenu'; 

// 🌟 ייבוא הפונקציה הנכונה שיודעת לשלוף קולקציות!
import { fetchCollection } from '@/lib/shop/fetchCollection'; 

export default async function PartsPage() {
  // אנחנו שולפים את קולקציית 'parts' במקום את עמוד הבית
  const [manufacturers, categories, menuItems, collectionData] = await Promise.all([
    fetchManufacturers(),
    fetchCategoryList(),
    fetchMenu('main-menu-new'),
    fetchCollection({ handle: 'parts' }) // 👈 כאן אנחנו קוראים לקולקציית החלפים
  ]);

  // מחלצים את המוצרים מתוך המידע שחזר מהקולקציה (אם לא חזר כלום, נשים מערך ריק)
  const partsProducts = collectionData?.products || [];

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
          <ManufacturerGrid manufacturers={manufacturers} />
        </div>

        {/* 🌟 עכשיו הקומפוננטה מקבלת אך ורק חלקי חילוף ישירות מהקולקציה */}
        <div className="mt-12 w-full px-2 md:px-4">
          <FeaturedProducts 
            products={partsProducts} // 👈 מעבירים את מוצרי קולקציית parts
            randomize={true} 
            title="חלפים שונים שכדאי להכיר"
            subtitle="מכל היצרנים"
            linkUrl="/shop/collection/parts" // 👈 עדכנתי את הלינק שיוביל לקולקציה עצמה
            linkText="לכל החלפים"
          />
        </div>

      </div>
    </ShopLayoutInternal>
  );
}