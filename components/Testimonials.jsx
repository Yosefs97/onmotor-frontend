// components/Testimonials.jsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // משיכת הנתונים מה-API שיצרנו
  useEffect(() => {
    fetch('/api/shopify/testimonials')
      .then(res => res.json())
      .then(data => {
        if (data.testimonials) setTestimonials(data.testimonials);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching testimonials:', err);
        setLoading(false);
      });
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      // גלילה מותאמת ל-RTL (ימינה חיובי, שמאלה שלילי)
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="text-center py-6 text-gray-500">טוען המלצות...</div>;
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div className="relative group w-full py-4">
      {/* כפתורי ניווט למחשב - מוסתרים במובייל */}
      <button 
        onClick={() => scroll('right')} 
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-sm p-2 rounded-full text-gray-600 hover:text-[#e60000] hover:shadow-md transition"
        aria-label="הקודם"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      <button 
        onClick={() => scroll('left')} 
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-sm p-2 rounded-full text-gray-600 hover:text-[#e60000] hover:shadow-md transition"
        aria-label="הבא"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* קונטיינר גלילה אופקית */}
      <div 
        ref={scrollRef} 
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {testimonials.map((testimonial) => (
          <div 
            key={testimonial.id} 
            className="min-w-[260px] max-w-[260px] md:min-w-[300px] md:max-w-[300px] flex-shrink-0 snap-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
          >
            <div className="relative w-full aspect-[3/4] bg-gray-50 flex items-center justify-center">
              {/* שימוש בתגית img רגילה מונע בעיות של next/image עם דומיינים חיצוניים משופיפיי שלא הוגדרו ב-next.config.js */}
              <img
                src={testimonial.imageUrl}
                alt={testimonial.altText}
                loading="lazy"
                className="w-full h-full object-contain p-2"
              />
            </div>
            
            {testimonial.text && (
              /* שורה 82 המעודכנת למטה - מודגש, ירוק-זית ב-Light mode, וירוק בהיר ב-Dark mode */
              <div className="p-3 text-center text-sm font-bold text-green-700 dark:text-green-400 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                {testimonial.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}