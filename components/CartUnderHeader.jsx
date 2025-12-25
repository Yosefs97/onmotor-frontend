// /components/CartUnderHeader.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CartButton from './CartButton';
import { ChevronDown } from 'lucide-react';

export default function CartUnderHeader({ menuItems = [] }) {
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    try {
        const res = await fetch('/api/shopify/cart/get');
        const json = await res.json();
        setTotal(json.cart?.estimatedCost?.totalAmount?.amount || 0);
    } catch (e) {
        console.error(e);
    }
  };

  useEffect(() => {
    fetchCart();
    const handler = () => fetchCart();
    window.addEventListener('cartUpdated', handler);
    return () => window.removeEventListener('cartUpdated', handler);
  }, []);

  return (
    // 👇 השינוי כאן: sticky במקום relative, ומיקום top-[80px]
    // זה ידביק את העגלה בדיוק מתחת להדר הראשי
    <div className="w-full bg-gray-100 border-b sticky top-[80px] z-40 transition-all" dir="rtl">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        
        {/* === צד ימין: סה"כ + תפריט === */}
        <div className="flex items-center gap-8">
            <div className="text-sm md:text-base font-bold text-gray-800 whitespace-nowrap">
                סה״כ: ₪{total}
            </div>

            {/* 👇👇👇 כאן נכנס התפריט (דסקטופ בלבד) 👇👇👇 */}
            <nav className="hidden md:flex items-center gap-6">
                {menuItems.map((category) => (
                    <div key={category.title} className="group relative">
                        
                        {/* הקישור הראשי */}
                        <Link 
                            href={category.url}
                            className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-red-600 transition-colors py-2"
                        >
                            {category.title}
                            {category.items.length > 0 && (
                                <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                            )}
                        </Link>

                        {/* התפריט שנפתח (Dropdown) */}
                        {category.items.length > 0 && (
                            <div className="
                                absolute top-full right-0 w-[600px] bg-white shadow-xl border border-gray-200 rounded-b-lg
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                transition-all duration-200 mt-1 z-50
                            ">
                                <div className="p-6 grid grid-cols-3 gap-6">
                                    {category.items.map((group, idx) => (
                                        <div key={idx} className="space-y-3">
                                            <h3 className="font-bold text-red-600 text-sm border-b pb-1">
                                                {group.title}
                                            </h3>
                                            <ul className="space-y-1">
                                                {group.items.map((item) => (
                                                    <li key={item.title}>
                                                        <Link 
                                                            href={item.url}
                                                            className="text-gray-600 hover:text-red-600 text-xs block font-medium"
                                                        >
                                                            {item.title}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </nav>
            {/* 👆👆👆 סוף התפריט 👆👆👆 */}
        </div>

        {/* === צד שמאל: כפתורים === */}
        <div className="flex items-center gap-2">
          <CartButton />
          <Link
            href="/shop/cart"
            prefetch={false}
            className="bg-[#e60000] text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-red-700 transition"
          >
            לסל הקניות
          </Link>
        </div>

      </div>
    </div>
  );
}