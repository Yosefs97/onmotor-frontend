// /app/shop/page.jsx
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
import MainCategoriesGrid from '@/components/MainCategoriesGrid'; 
import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';

export const revalidate = 600;

export default async function ShopPage() {
  // שינינו את הפונקציה כך שלא צריך לשלוח לה רשימה, היא יודעת לבד
  const [manufacturers, categories] = await Promise.all([
    fetchManufacturers(),
    fetchCategoryList() 
  ]);

  console.log('Final Categories Check:', categories); // לראות בלוגים אם זה עבד

  return (
    <ShopLayoutInternal>
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