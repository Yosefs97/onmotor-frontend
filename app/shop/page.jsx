// /app/shop/page.jsx
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
// 👇 הוספת הרכיבים החדשים שיצרנו
import MainCategoriesGrid from '@/components/MainCategoriesGrid'; 
import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';

export const revalidate = 600;

// רשימת הקטגוריות שיופיעו בקוביות למעלה (לפי ה-Handle בשופיפיי)
const CATEGORY_HANDLES = [
  'helmets',
  'clothing',
  'gloves',
  'offroad-gear',
  'oils',
  'accessories'
];

export default async function ShopPage() {
  // 👇 שימוש ב-Promise.all כדי לטעון את שניהם במקביל (מהיר יותר)
  const [manufacturers, categories] = await Promise.all([
    fetchManufacturers(),
    fetchCategoryList(CATEGORY_HANDLES)
  ]);

  return (
    <ShopLayoutInternal>
      
      {/* 1. החלק העליון: הקוביות של הציוד */}
      <div className="w-full mt-6 mb-10 px-2 md:px-0">
        <MainCategoriesGrid categories={categories} />
      </div>

      {/* קו הפרדה (אופציונלי) */}
      <div className="border-t border-gray-200 my-8 mx-6" />

      {/* 2. החלק התחתון: יצרני האופנועים */}
      <div className="w-full px-2 md:px-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-1.5 h-8 bg-black/80 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-900">
            איתור חלפים לפי יצרן
          </h2>
        </div>

        {/* רשימת היצרנים (שעכשיו מסוננת ונראית נקי) */}
        <ManufacturerGrid manufacturers={manufacturers} />
      </div>

    </ShopLayoutInternal>
  );
}