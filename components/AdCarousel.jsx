//components\AdCarousel.jsx
'use client';
import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdCarousel({ title, items }) {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // --- גלילה אוטומטית ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered && scrollRef.current) {
        const container = scrollRef.current;
        
        // בדיקה האם הגענו לסוף (ב-RTL סוף הגלילה הוא בצד שמאל, ערך שלילי)
        // הערה: חישוב גלילה ב-RTL יכול להשתנות בין דפדפנים, הלוגיקה כאן מכוונת לכרום/אדג' מודרניים
        const maxScroll = -(container.scrollWidth - container.clientWidth);
        
        if (container.scrollLeft <= maxScroll + 5) { 
           // חזרה להתחלה (ימינה)
           container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
           // גלילה שמאלה (קדימה ב-RTL)
           container.scrollBy({ left: -300, behavior: 'smooth' });
        }
      }
    }, 3500); // כל 3.5 שניות

    return () => clearInterval(interval);
  }, [isHovered]);

  // --- גלילה ידנית ---
  const scroll = (direction) => {
    if (scrollRef.current) {
      // ב-RTL: 
      // left (הבא) = ערך שלילי
      // right (הקודם) = ערך חיובי
      const amount = direction === 'next' ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="my-8 relative group/container dir-rtl">
      {/* כותרת הסקשן */}
      <h3 className="text-2xl font-bold text-gray-900 mb-4 border-r-4 border-[#e60000] pr-3">
        {title}
      </h3>

      {/* --- חיצים (למחשב בלבד) --- */}
      {/* חץ ימינה (אחורה) */}
      <button 
        onClick={() => scroll('prev')}
        className="hidden md:block absolute right-0 top-[60%] -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover/container:opacity-100 transition-opacity border border-gray-100"
        aria-label="גלול ימינה"
      >
        ➜
      </button>

      {/* חץ שמאלה (קדימה) */}
      <button 
        onClick={() => scroll('next')}
        className="hidden md:block absolute left-0 top-[60%] -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover/container:opacity-100 transition-opacity border border-gray-100 rotate-180"
        aria-label="גלול שמאלה"
      >
        ➜
      </button>

      {/* --- הקונטיינר הנגלל --- */}
      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="
          flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-1
          w-full
        "
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((ad) => (
          <Link 
            key={ad.id} 
            href={ad.link || '#'} 
            target="_blank"
            className="
              flex-shrink-0 snap-start bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-[#e60000] transition-all overflow-hidden group
              /* במובייל: 2 פריטים (כ-45% רוחב כדי שיראו את השוליים). במחשב: 3 פריטים */
              w-[calc(50%-10px)] md:w-[calc(33.333%-14px)]
            "
          >
            {/* תמונה */}
            <div className="relative w-full h-32 md:h-48 bg-gray-100 border-b border-gray-100">
               {ad.image?.url ? (
                  <Image 
                    src={ad.image.url} 
                    alt={ad.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-50 text-sm">
                   אין תמונה
                 </div>
               )}
            </div>

            {/* תוכן */}
            <div className="p-3">
              <h4 className="font-bold text-sm md:text-lg text-gray-900 line-clamp-1 mb-1 group-hover:text-[#e60000]">
                {ad.title}
              </h4>
              <p className="text-xs md:text-sm text-gray-500 line-clamp-2 leading-tight min-h-[2.5em]">
                {ad.description}
              </p>
              <div className="mt-3 text-xs md:text-sm font-bold text-[#e60000] flex items-center gap-1">
                לפרטים נוספים <span>←</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}