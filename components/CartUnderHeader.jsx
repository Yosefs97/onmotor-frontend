// /components/CartUnderHeader.jsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import CartButton from './CartButton';

export default function CartUnderHeader() {
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    const res = await fetch('/api/shopify/cart/get');
    const json = await res.json();
    setTotal(json.cart?.estimatedCost?.totalAmount?.amount || 0);
  };

  useEffect(() => {
    fetchCart();
    const handler = () => fetchCart();
    window.addEventListener('cartUpdated', handler);
    return () => window.removeEventListener('cartUpdated', handler);
  }, []);

  return (
    <div className="w-full bg-gray-100 border-b py-2 px-4 flex items-center justify-between">
      <div className="text-sm md:text-base font-bold text-gray-800">
        סה״כ: ₪{total}
      </div>
      <div className="flex items-center gap-2">
        <CartButton />
        <Link
          href="/shop/cart"
          className="bg-[#e60000] text-white left-0 px-2 py-2 rounded text-sm font-bold hover:bg-red-700 transition"
        >
          לסל הקניות
        </Link>
      </div>
    </div>
  );
}
