// /app/shop/layout.jsx
import CartUnderHeader from "@/components/CartUnderHeader";

export default function ShopLayout({ children }) {
  return (
    <div className="w-full min-h-screen bg-white">
      <CartUnderHeader />  {/* ✅ פס עליון של העגלה */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}