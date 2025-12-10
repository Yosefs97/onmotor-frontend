// /components/ManufacturerGrid.jsx
'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollSearchBar from './ScrollSearchBar';

export default function ManufacturerGrid({ manufacturers }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // 🎬 אנימציית "רמז גלילה" משופרת
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // פונקציית ביטול כדי לא להשאיר זנבות אם הקומפוננטה יוצאת
    let animationFrameId;
    let timeoutId;

    const startAnimation = () => {
      let start = null;
      // חישוב דינמי: חצי מרוחב הקונטיינר (או 250px, הגדול מביניהם)
      const screenWidth = el.clientWidth;
      const maxOffset = Math.max(screenWidth * 0.6, 200); 
      const duration = 2000; // הארכנו ל-2 שניות לתנועה רכה יותר

      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        // שימוש בפונקציית Easing (Ease In Out) לתנועה טבעית יותר מסתם סינוס
        // אבל נשמור על סינוס כי הוא פשוט ועושה את העבודה (0 -> 1 -> 0)
        const ease = Math.sin((progress / duration) * Math.PI); 
        
        el.scrollLeft = ease * maxOffset;

        if (!hasScrolled && progress < duration) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
            // בסיום האנימציה, לוודא שחזרנו ל-0 נקי
            if (!hasScrolled) el.scrollLeft = 0;
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleUserScroll = () => {
      // אם המשתמש נגע - נעצור הכל
      setHasScrolled(true);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };

    el.addEventListener('scroll', handleUserScroll, { once: true });
    el.addEventListener('touchstart', handleUserScroll, { once: true }); // חשוב למובייל
    el.addEventListener('wheel', handleUserScroll, { once: true });

    // מתחילים רק אחרי שנייה, כדי לתת לדף להיטען ולמשתמש להבין מה קורה
    timeoutId = setTimeout(startAnimation, 1000);

    return () => {
      el.removeEventListener('scroll', handleUserScroll);
      el.removeEventListener('touchstart', handleUserScroll);
      el.removeEventListener('wheel', handleUserScroll);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [hasScrolled]);

  if (!manufacturers.length)
    return <p className="text-center py-8">לא נמצאו יצרנים</p>;

  return (
    <div>
      <ScrollSearchBar placeholder="חפש יצרן או החלק שמאלה" containerRef={containerRef} />

      <div
        ref={containerRef}
        className="scroll-container flex overflow-x-scroll space-x-1 pb-4 px-2 snap-x snap-mandatory scroll-smooth"
      >
        {manufacturers.map((m) => (
          <Link
            key={m.id}
            href={`/shop/vendor/${m.handle}`}
            prefetch={false}
            data-name={m.title}
            className="min-w-[160px] flex-shrink-0 border rounded-lg p-4 shadow hover:shadow-lg transition snap-start bg-white"
          >
            {m.image?.url && (
              <div className="relative w-full h-24 mb-2">
                <Image
                  src={m.image.url}
                  alt={m.image.altText || m.title}
                  fill
                  style={{ objectFit: 'contain' }}
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
