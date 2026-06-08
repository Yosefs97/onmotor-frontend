// /app/shop/page.jsx
export const dynamic = 'force-dynamic';

import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import MainCategoriesGrid from '@/components/MainCategoriesGrid'; 
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';
import { fetchMenu } from '@/lib/shopify/fetchMenu'; 

export default async function ShopPage() {
  const [categories, menuItems] = await Promise.all([
    fetchCategoryList(),
    fetchMenu('mega-menu-1') 
  ]);

  return (
    // הוספנו hideSidebar={true} כדי שהקוביות יתפרסו על כל המסך
    <ShopLayoutInternal menuItems={menuItems} categories={categories} hideSidebar={true}>
      
      <div className="flex flex-col items-center gap-8 py-8 px-4 w-full max-w-7xl mx-auto">
        
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase mb-4">
            החנות של <span className="text-[#e60000]">OnMotor</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium">בחר קטגוריה כדי להתחיל</p>
        </div>

        {/* רשת הקוביות הא-סימטרית (Bento Grid) שמקבלת את כל הבמה */}
        <div className="w-full">
           <MainCategoriesGrid categories={categories} />
        </div>

      </div>

    </ShopLayoutInternal>
  );
}