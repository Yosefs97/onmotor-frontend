// /app/shop/layout.jsx
import CartUnderHeader from "@/components/CartUnderHeader";
import { fetchMenu } from '@/lib/shopify/fetchMenu'; // 👈 1. ייבוא הפונקציה

export default async function ShopLayout({ children }) {
  // 👈 2. שליפת התפריט (רץ על השרת)
  const menuItems = await fetchMenu('mega-menu-1');

  return (
    <div className="w-full min-h-screen bg-white">
      {/* 👈 3. העברת הנתונים לקומפוננטה */}
      <CartUnderHeader menuItems={menuItems} /> 
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}