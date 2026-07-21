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
    <ShopLayoutInternal menuItems={menuItems} categories={categories} hideSidebar={true}>
      <div className="flex flex-col items-center gap-1 py-1 px-4 w-full max-w-7xl mx-auto">
        
        {/* כותרת מבצע משלוח חינם */}
        <div className="text-center w-full mt-1">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight bg-gray-50 py-3 px-6 rounded-xl inline-block border border-gray-200 shadow-sm">
            משלוח חינם עד הבית בכל* רכישה מעל <span className="text-[#e60000]">₪499</span>
          </h1>
        </div>

        {/* רשת הקוביות */}
        <div className="w-full">
           <MainCategoriesGrid categories={categories} />
        </div>
      </div>
    </ShopLayoutInternal>
  );
}