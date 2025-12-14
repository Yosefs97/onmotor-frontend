// /app/shop/page.jsx
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
import MainCategoriesGrid from '@/components/MainCategoriesGrid'; 
import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';

export const revalidate = 600;

// רשימת הקטגוריות שיופיעו בקוביות הגדולות למעלה
const CATEGORY_HANDLES = [
  'helmets',      // קסדות
  'clothing',     // ביגוד
  'gloves',       // כפפות
  'offroad-gear', // ציוד שטח
  'oils',         // שמנים
  'accessories'   // אביזרים
];

export default async function ShopPage() {
  // טעינה במקביל: גם היצרנים (המסוננים) וגם הקטגוריות
  const [manufacturers, categories] = await Promise.all([
    fetchManufacturers(),         
    fetchCategoryList(CATEGORY_HANDLES) 
  ]);

  return (
    <ShopLayoutInternal>
      
      {/* 1. החלק העליון: הקוביות היפות לציוד */}
      <div className="w-full mt-4 mb-10">
        <MainCategoriesGrid categories={categories} />
      </div>

      {/* קו הפרדה */}
      <div className="border-t border-gray-200 my-8 mx-4" />

      {/* 2. החלק התחתון: יצרני אופנועים בלבד (בזכות ה-Metafield) */}
      <div className="w-full px-2 md:px-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-1.5 h-8 bg-black/80 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-900">
            איתור חלפים לפי יצרן
          </h2>
        </div>

        <ManufacturerGrid manufacturers={manufacturers} />
      </div>

    </ShopLayoutInternal>
  );
}