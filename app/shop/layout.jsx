import ShopHeader from "@/components/ShopHeader"; // ההידר החדש שיצרנו
import CartUnderHeader from "@/components/CartUnderHeader"; // שורת הפיצ'רים המקורית
import { fetchMenu } from '@/lib/shopify/fetchMenu';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';

export default async function ShopLayout({ children }) {
  // מחזירים את משיכת הנתונים כדי שהחיפוש והתפריטים יעבדו כרגיל
  const [menuItems, categories] = await Promise.all([
    fetchMenu('mega-menu-1'),
    fetchCategoryList()
  ]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      
      {/* 1. ההידר העליון החדש עם הלוגו המונפש והשם OnMotor Parts */}
      <ShopHeader /> 
      
      {/* 2. שורת החיפוש, עגלת הקניות ושאר הפיצ'רים המקוריים של החנות */}
      <CartUnderHeader menuItems={menuItems} categories={categories} /> 
      
      <main className="container mx-auto px-4 py-0 mt-4">
        {children}
      </main>
    </div>
  );
}