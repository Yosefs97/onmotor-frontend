// /components/ManufacturerGrid.jsx
'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollSearchBar from './ScrollSearchBar';
// 👇 1. ייבוא הכפתור
import MobileShopFilterBar from './MobileShopFilterBar';

export default function ManufacturerGrid({ manufacturers }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const isUserInteracting = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let start = null;
    let timeoutId;

    const stopAnimation = () => {
      isUserInteracting.current = true;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const animate = (timestamp) => {
      if (isUserInteracting.current) return;

      if (!start) start = timestamp;
      const duration = 2500;
      const progress = timestamp - start;
      const ease = Math.sin((Math.min(progress / duration, 1)) * Math.PI);
      const amountToScroll = Math.max(el.clientWidth * 0.6, 200);
      
      el.scrollLeft = ease * amountToScroll;

      if (progress < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        el.scrollLeft = 0;
      }
    };

    timeoutId = setTimeout(() => {
        if(!isUserInteracting.current) {
            animationRef.current = requestAnimationFrame(animate);
        }
    }, 1000);

    const events = ['touchstart', 'wheel', 'mousedown', 'keydown'];
    events.forEach(evt => el.addEventListener(evt, stopAnimation, { once: true }));

    return () => {
      events.forEach(evt => el.removeEventListener(evt, stopAnimation));
      cancelAnimationFrame(animationRef.current);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!manufacturers.length)
    return <p className="text-center py-8">לא נמצאו יצרנים</p>;

  // 👇 הוספנו את יצירת המערך המותאם לחיפוש עם הקישור (href)
  const searchOptions = manufacturers.map((m) => ({
    id: m.id || m.handle,
    title: m.title,
    href: `/shop/vendor/${m.handle}`
  }));

  return (
    <div>
      {/* 👇 2. עיטוף שורת החיפוש והכפתור באותה שורה */}
      <div className="flex gap-2 items-center mb-4 md:mb-2">
         {/* החיפוש תופס את כל הרוחב שנשאר */}
         <div className="flex-grow">
            <ScrollSearchBar 
                placeholder="חפש יצרן או החלק שמאלה" 
                containerRef={containerRef} 
                manufacturers={searchOptions} /* 👈 העברנו את המערך החדש במקום manufacturers הרגיל */
            />
         </div>
         
         {/* כפתור הסינון - מוצג רק במובייל (ה-component עצמו מטפל ב-hidden ב-md) */}
         <div className="flex-shrink-0">
             <MobileShopFilterBar />
         </div>
      </div>
      {/* 👆 סוף השינוי */}

      <div
        ref={containerRef}
        className="scroll-container flex overflow-x-scroll space-x-1 pb-2 px-2 snap-x snap-mandatory"
      >
        {manufacturers.map((m) => (
          <Link
            key={m.id}
            href={`/shop/vendor/${m.handle}`}
            prefetch={false}
            data-name={m.title}
            className="min-w-[160px] flex-shrink-0 border rounded-lg p-4 shadow hover:shadow-lg transition snap-start bg-white select-none"
          >
            {m.image?.url && (
              <div className="relative w-full h-24 mb-2">
                <Image
                  src={m.image.url}
                  alt={m.image.altText || m.title}
                  fill
                  style={{ objectFit: 'contain' }}
                  draggable={false} 
                />
              </div>
            )}
            <p className="text-center font-semibold text-gray-900 hover:text-[#e60000] transition-colors duration-200">
              {m.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}