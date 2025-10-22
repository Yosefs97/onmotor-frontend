// /app/shop/cart/page.jsx
'use client';
import Link from "next/link";
import { useEffect, useState } from 'react';
import ShopSidebar from '@/components/ShopSidebar';
import MobileShopFilterBar from '@/components/MobileShopFilterBar';
import ProductGrid from '@/components/ProductGrid';
import ShopInfoAccordion from '@/components/ShopInfoAccordion'; // ✅ חדש

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // חיפוש מוצרים
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
  const [activeFilters, setActiveFilters] = useState({}); // ✅ שמירת פילטרים נוכחיים

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const res = await fetch('/api/shopify/cart/get');
    const json = await res.json();
    setCart(json.cart);
    setLoading(false);
  };

  const updateQuantity = async (lineId, quantity) => {
    if (quantity < 1) return;
    const res = await fetch('/api/shopify/cart/update', {
      method: 'POST',
      body: JSON.stringify({ lineId, quantity }),
    });
    const json = await res.json();
    setCart(json.cart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = async (lineId) => {
    const res = await fetch('/api/shopify/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ lineId }),
    });
    const json = await res.json();
    setCart(json.cart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // חיפוש בפועל (GET עם query string)
  const handleFilterChange = async (filters) => {
    setLoadingProducts(true);
    setActiveFilters(filters); // ✅ שמירת הפילטרים
    try {
      const params = new URLSearchParams({ ...filters, limit: '24' });
      const res = await fetch(`/api/shopify/search?${params.toString()}`);
      const json = await res.json();

      setProducts(json.items || []);
      setPageInfo(json.pageInfo || { hasNextPage: false, endCursor: null });
    } catch (err) {
      console.error("handleFilterChange error:", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ✅ כותרת דינמית לפי פילטרים (כולל יצרן + דגם)
  const getDynamicTitle = () => {
    if (activeFilters.vendor && activeFilters.model) {
      return `מוצרים נוספים עבור ${activeFilters.vendor} ${activeFilters.model}`;
    }
    if (activeFilters.vendor) {
      return `מוצרי ${activeFilters.vendor} נוספים שאתה צריך לאופנוע שלך`;
    }
    if (activeFilters.model) {
      return `מוצרים נוספים עבור דגם ${activeFilters.model}`;
    }
    if (activeFilters.year) {
      return `מוצרים נוספים לשנת ${activeFilters.year}`;
    }
    return "מוצרים שיכולים לעניין אותך";
  };

  if (loading) return <div dir="rtl">טוען...</div>;

  return (
    <div dir="rtl" className="space-y-6">
      {/* 🔗 פירורי לחם */}
      <nav className="text-sm text-gray-600">
        <ol className="flex gap-2">
          <li><Link href="/shop" className="hover:underline">חנות</Link></li>
          <li>&gt;</li>
          <li className="text-gray-800 font-medium">עגלת קניות</li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-4 gap-6">
        {/* 🔍 מנוע סינון בצד ימין – רק בדסקטופ */}
        <aside className="hidden md:block md:col-span-1">
          <ShopSidebar onFilterChange={handleFilterChange} />
        </aside>

        {/* 🛒 עגלה + מוצרים */}
        <main className="md:col-span-3 space-y-6">
          {/* 🔍 כפתור סינון צף – רק במובייל */}
          <div className="md:hidden">
            <MobileShopFilterBar onFilterChange={handleFilterChange} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">עגלה</h1>

          {!cart || cart.lines.edges.length === 0 ? (
            <div>העגלה ריקה</div>
          ) : (
            <div className="space-y-4">
              {cart.lines.edges.map(({ node }) => (
                <div
                  key={node.id}
                  className="flex items-center gap-4 border p-2 rounded-md bg-white"
                >
                  <img
                    src={node.merchandise.product.featuredImage?.url}
                    alt={node.merchandise.product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <Link
                      href={`/shop/${node.merchandise.product.handle}`}
                      className="font-medium text-blue-600 hover:underline block"
                    >
                      {node.merchandise.product.title}
                    </Link>
                    <div className="text-sm text-gray-600">כמות: {node.quantity}</div>
                  </div>

                  {/* 🔢 כפתורי כמות */}
                  <div className="flex border rounded-md overflow-hidden">
                    <button
                      onClick={() => updateQuantity(node.id, node.quantity - 1)}
                      className="px-3 py-1 border-l hover:bg-gray-100 text-gray-900"
                    >
                      -
                    </button>
                    <div className="px-4 py-1 text-center text-gray-900">{node.quantity}</div>
                    <button
                      onClick={() => updateQuantity(node.id, node.quantity + 1)}
                      className="px-3 py-1 border-r hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  {/* ❌ כפתור הסרה */}
                  <button
                    onClick={() => removeItem(node.id)}
                    className="text-red-600 hover:underline ml-2"
                  >
                    הסר
                  </button>
                </div>
              ))}

              {/* סה״כ ותשלום */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-xl font-bold text-gray-900">
                  סה"כ: {cart.estimatedCost.totalAmount.amount}{' '}
                  {cart.estimatedCost.totalAmount.currencyCode}
                </div>
                <a
                  href={cart.checkoutUrl}
                  target="_blank"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
                >
                  לתשלום
                </a>
              </div>
            </div>
          )}

          {/* תוצאות חיפוש */}
          {loadingProducts && <div>טוען מוצרים...</div>}
          {products.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold mb-3">{getDynamicTitle()}</h2>
              <ProductGrid
                products={products}
                loading={loadingProducts}
                onLoadMore={() => handleFilterChange({ cursor: pageInfo.endCursor })}
                hasMore={pageInfo.hasNextPage}
              />
            </section>
          )}

          {/* 📦 מידע נוסף (משלוחים / אחריות / החזרות) */}
          <ShopInfoAccordion />
        </main>
      </div>
    </div>
  );
}
