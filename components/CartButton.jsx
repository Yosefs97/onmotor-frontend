// /components/CartButton.jsx
'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartButton() {
  const [count, setCount] = useState(0);

  const fetchCart = async () => {
    const res = await fetch('/api/shopify/cart/get');
    const json = await res.json();
    setCount(json.cart?.totalQuantity || 0);
  };

  useEffect(() => {
    fetchCart();
    const handler = () => fetchCart();
    window.addEventListener('cartUpdated', handler);
    return () => window.removeEventListener('cartUpdated', handler);
  }, []);

  return (
    <Link href="/shop/cart" className="relative inline-flex items-center" prefetch={false}>
      <ShoppingCart className="w-6 h-6 text-gray-800 hover:text-[#e60000]" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#e60000] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
