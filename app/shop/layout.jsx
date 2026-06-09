// app/shop/layout.jsx
import ShopHeader from "@/components/ShopHeader";
import CartUnderHeader from "@/components/CartUnderHeader";
import { fetchMenu } from '@/lib/shopify/fetchMenu';
import { fetchCategoryList } from '@/lib/shop/fetchCategoryList';

export default async function ShopLayout({ children }) {
  const [menuItems, categories] = await Promise.all([
    fetchMenu('mega-menu-1'),
    fetchCategoryList()
  ]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      
      {/* ההידר העליון הדינמי */}
      <ShopHeader menuItems={menuItems} categories={categories} />
      
      {/* שורת החיפוש והקטגוריות למובייל בלבד */}
      <CartUnderHeader categories={categories} />
      
      <main className="container mx-auto px-4 py-0 mt-4">
        {children}
      </main>
    </div>
  );
}