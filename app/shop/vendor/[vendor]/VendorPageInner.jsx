// /app/shop/vendor/[vendor]/VendorPageInner.jsx
'use client';

import { useRef, useState, useEffect } from 'react';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import Image from 'next/image';
import Link from 'next/link';
import ScrollSearchBar from '@/components/ScrollSearchBar';

export default function VendorPageInner({ vendor, models }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // 🎬 אנימציית "רמז גלילה"
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let start = null;
    const maxOffset = 60;
    const duration = 1000;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const offset = Math.sin((progress / duration) * Math.PI) * maxOffset;
      el.scrollLeft = offset;

      if (!hasScrolled && progress < duration * 2) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationRef.current);
      }
    };

    const handleUserScroll = () => {
      setHasScrolled(true);
      cancelAnimationFrame(animationRef.current);
    };

    el.addEventListener('scroll', handleUserScroll, { once: true });
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      el.removeEventListener('scroll', handleUserScroll);
      cancelAnimationFrame(animationRef.current);
    };
  }, [hasScrolled]);

  return (
    <ShopLayoutInternal>
      {/* 🔍 שורת חיפוש */}
      <ScrollSearchBar
        placeholder={`החלק שמאלה או חפש דגם ${vendor}`}
        containerRef={containerRef}
      />

      {/* 📌 רשימת הדגמים */}
      <div
        ref={containerRef}
        className="scroll-container flex overflow-x-scroll space-x-1 pb-4 px-2 snap-x snap-mandatory scroll-smooth"
      >
        {models.map((m) => (
          <Link
            key={m.name}
            href={`/shop/vendor/${vendor}/${m.handle}`}
            prefetch={false}
            className="min-w-[160px] flex-shrink-0 border rounded-lg p-4 shadow hover:shadow-lg transition snap-start bg-white"
          >
            {m.image && (
              <div className="relative w-full h-24 mb-2">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
            <p className="text-center font-semibold text-gray-900 hover:text-[#e60000] transition-colors duration-200">
              {m.name}
            </p>
          </Link>
        ))}
      </div>
    </ShopLayoutInternal>
  );
}
