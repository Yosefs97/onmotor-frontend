// /app/shop/page.jsx
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
import MainCategoriesGrid from '@/components/MainCategoriesGrid'; // 🔥 הרכיב החדש
import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList'; // 🔥 פונקציית השליפה החדשה

export const revalidate = 600; // 10 דקות ISR

// רשימת ה-Handles של הקטגוריות שאתה רוצה להציג בראש הדף
// (אלו השמות שהגדרת ב-URL Handle בתוך שופיפיי)
const CATEGORY_HANDLES = [
  'helmets',
  'clothing',
  'gloves',
  'offroad-gear',
  'oils',
  'accessories'
];

export default async function ShopPage() {
  // 🔥 שימוש ב-Promise.all: טוען את שני הנתונים במקביל לביצועים מקסימליים
  const [manufacturers, categories] = await Promise.all([
    fetchManufacturers(),
    fetchCategoryList(CATEGORY_HANDLES)
  ]);

  return (
    <ShopLayoutInternal>
      
      {/* 1. החלק החדש: קטגוריות ראשיות (קסדות, ביגוד וכו') */}
      <div className="w-full mt-4 mb-8">
        <MainCategoriesGrid categories={categories} />
      </div>

      {/* קו הפרדה עדין (אופציונלי) */}
      <div className="border-t border-gray-200 my-8 mx-4" />

      {/* 2. החלק הקיים: איתור חלפים לפי יצרן */}
      <div className="w-full px-2 md:px-4">
        {/* הוספתי כותרת כדי להפריד ויזואלית בין הציוד לחלפים */}
        <div className="flex items-center gap-3 mb-6 px-2">
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