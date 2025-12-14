// /app/shop/page.jsx
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
import MainCategoriesGrid from '@/components/MainCategoriesGrid'; 
import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';
// import { fetchCategoryList } from '@/lib/shop/fetchCategoryList'; // 👈 נטרלתי זמנית

export const revalidate = 600;

export default async function ShopPage() {
  const manufacturers = await fetchManufacturers();
  
  // 👇 נתונים מזויפים לבדיקה בלבד!
  const fakeCategories = [
    { title: 'בדיקת קסדות', handle: 'helmets', href: '#', image: 'https://cdn.shopify.com/s/files/1/0663/6666/9051/files/helmets-test.jpg' },
    { title: 'בדיקת שמנים', handle: 'oils', href: '#', image: null }, // בדיקת פלייסהולדר
  ];

  return (
    <ShopLayoutInternal>
      
      <div className="bg-yellow-100 p-4 text-center text-red-600 font-bold">
        מצב בדיקה פעיל: אם אתה רואה את זה, המערכת עובדת!
      </div>

      {/* הקוביות עם הנתונים המזויפים */}
      <div className="w-full mt-6 mb-10 px-2 md:px-0">
        <MainCategoriesGrid categories={fakeCategories} />
      </div>

      <div className="border-t border-gray-200 my-8 mx-6" />

      <div className="w-full px-2 md:px-4">
        <h2 className="text-2xl font-bold mb-4 px-2">איתור חלפים לפי יצרן</h2>
        <ManufacturerGrid manufacturers={manufacturers} />
      </div>

    </ShopLayoutInternal>
  );
}