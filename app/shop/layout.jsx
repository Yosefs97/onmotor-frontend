export const dynamic = "force-dynamic";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartUnderHeader from "@/components/CartUnderHeader";

export default function ShopRootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-white">

        {/* ✔ Header של האתר */}
        <Header />

        {/* ✔ פס עליון של העגלה – אפשר להשאיר */}
        <CartUnderHeader />

        {/* ✔ כאן התוכן של החנות */}
        <main className="min-h-screen w-full container mx-auto px-4 py-6">
          {children}
        </main>

        {/* ✔ Footer של האתר */}
        <Footer />

      </body>
    </html>
  );
}
