'use client';
import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdCarousel({ title, items }) {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // --- גלילה אוטומטית (זהה למקור) ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered && scrollRef.current) {
        const container = scrollRef.current;
        
        // בדיקה האם הגענו לסוף (ב-RTL סוף הגלילה הוא בצד שמאל, ערך שלילי)
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
      const amount = direction === 'next' ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="my-6 relative group/container dir-rtl">
      {/* כותרת הסקשן */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-2xl font-bold text-gray-900 border-r-4 border-[#e60000] pr-3">
          {title}
        </h3>
      </div>

      {/* --- חיצים (למחשב בלבד) --- */}
      <button 
        onClick={() => scroll('prev')}
        className="hidden md:block absolute right-0 top-[60%] -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover/container:opacity-100 transition-opacity border border-gray-100"
        aria-label="גלול ימינה"
      >
        ➜
      </button>

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
          flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2 px-1
          w-full
        "
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((ad) => (
          <Link 
            key={ad.id} 
            href={ad.link || '#'} 
            target="_blank" // פותח בלשונית חדשה כי זה פרסומת/שירות חיצוני
            prefetch={false}
            className="
              group flex flex-col flex-shrink-0 snap-start 
              bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden
              transition-all duration-300
              hover:shadow-md hover:border-[#e60000] hover:-translate-y-1
              /* שמירה על הציפוף המבוקש */
              w-[calc(50%-10px)] md:w-[calc(33.333%-14px)]
            "
          >
            {/* תמונה - גובה קבוע כדי לשמור על אחידות בקרוסלה */}
            <div className="relative w-full h-32 md:h-48 bg-gray-100 border-b border-gray-100 overflow-hidden">
               {ad.image?.url ? (
                  <Image 
                    src={ad.image.url} 
                    alt={ad.title || 'תמונה'}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-50 text-sm">
                   אין תמונה
                 </div>
               )}
            </div>

            {/* תוכן */}
            <div className="flex flex-col flex-grow p-3">
              {/* כותרת */}
              <h4 className="font-bold text-gray-900 text-sm md:text-lg line-clamp-1 mb-1 group-hover:text-[#e60000] transition-colors">
                {ad.title}
              </h4>
              
              {/* תיאור */}
              <p className="text-gray-500 text-xs md:text-sm line-clamp-2 leading-tight flex-grow">
                {ad.description}
              </p>
              
              {/* כפתור הנעה לפעולה */}
              <div className="mt-2 pt-2 border-t border-gray-100 w-full">
                <span className="text-xs md:text-sm font-bold text-[#e60000] flex items-center gap-1">
                  לפרטים נוספים <span>←</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}