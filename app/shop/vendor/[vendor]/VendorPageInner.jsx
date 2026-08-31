// /app/shop/vendor/[vendor]/VendorPageInner.jsx
'use client';

import { useRef, useState, useEffect } from 'react';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import Image from 'next/image';
import Link from 'next/link';
import ScrollSearchBar from '@/components/ScrollSearchBar';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs';
import FeaturedProducts from '@/components/FeaturedProducts'; // 👈 ייבוא הבלוק

// 👇 שים לב: הוספנו את products כפרופ (prop) לפונקציה
export default function VendorPageInner({ vendor, models, products = [] }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  const decodedVendor = decodeURIComponent(vendor);

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

  const searchOptions = models.map((m) => ({
    id: m.handle || m.name, 
    title: m.name,          
    href: `/shop/vendor/${vendor}/${m.handle}`
  }));

  return (
    <ShopLayoutInternal>
      
      <div className="px-2 md:px-0 mt-2">
         <AutoShopBreadcrumbs filters={{ vendor: decodedVendor }} />
      </div>

      <ScrollSearchBar
        placeholder={`החלק שמאלה או חפש דגם ${decodedVendor}`}
        containerRef={containerRef}
        manufacturers={searchOptions} 
      />

      <div
        ref={containerRef}
        className="scroll-container flex overflow-x-scroll space-x-1 pb-2 px-2 snap-x snap-mandatory scroll-smooth"
      >
        {models.map((m) => (
          <Link
            key={m.name}
            href={`/shop/vendor/${vendor}/${m.handle}`}
            prefetch={false}
            data-name={m.name}
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

      {/* 🌟 הוספנו כאן את הבלוק ששולף רק את מוצרי היצרן הנוכחי 🌟 */}
      <div className="mt-8 px-2 md:px-0">
        <FeaturedProducts 
          products={products} 
          targetVendor={decodedVendor} // 👈 פה הקסם: רק מוצרים של היצרן הזה!
          title={`מוצרים נבחרים של ${decodedVendor}`}
          subtitle="המלצות יצרן"
          linkUrl={`/shop/parts`} // אפשר להפנות לדף חיפוש כללי
          linkText="חזרה לכל היצרנים"
        />
      </div>

    </ShopLayoutInternal>
  );
}