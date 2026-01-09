import CartUnderHeader from "@/components/CartUnderHeader";
import { fetchMenu } from '@/lib/shopify/fetchMenu';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList'; // 👈 1. הוספת הייבוא הזה

export default async function ShopLayout({ children }) {
  // 👈 2. משיכת הקטגוריות והתפריט במקביל
  const [menuItems, categories] = await Promise.all([
    fetchMenu('mega-menu-1'),
    fetchCategoryList()
  ]);

  return (
    <div className="w-full min-h-screen bg-white">
      {/* 👈 3. העברת ה-categories לקומפוננטה */}
      <CartUnderHeader menuItems={menuItems} categories={categories} /> 
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}