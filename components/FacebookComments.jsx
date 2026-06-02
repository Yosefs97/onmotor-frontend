// components/FacebookComments.jsx
'use client';
import { useEffect, useState, useRef } from 'react';

export default function FacebookComments({ url }) {
  const [pageUrl, setPageUrl] = useState('');
  const containerRef = useRef(null);

  // 1. קביעת הכתובת שעליה מגיבים
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(url || window.location.href.split('?')[0]);
    }
  }, [url]);

  // 2. קריאה לפייסבוק לרנדר את התגובות
  useEffect(() => {
    // אנחנו נותנים ל-React רגע לסיים לצייר את ה-DOM עם ה-setTimeout
    const timeoutId = setTimeout(() => {
      if (pageUrl && window.FB && window.FB.XFBML) {
        // אם תפסנו את הקונטיינר, נבקש מפייסבוק לסרוק רק אותו
        if (containerRef.current) {
          window.FB.XFBML.parse(containerRef.current);
        } else {
          window.FB.XFBML.parse();
        }
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [pageUrl]);

  if (!pageUrl) return null;

  return (
    <div className="mt-4 w-full min-h-[150px]" ref={containerRef}>
      {/* השימוש ב-key עם הכתובת הוא קריטי! 
        הוא אומר ל-React: "אם הכתובת השתנתה, תמחק את הדיב הישן ותייצר אחד חדש לגמרי".
        זה מונע מפייסבוק להיתקע על גובה 0.
      */}
      <div
        key={pageUrl}
        className="fb-comments w-full"
        data-href={pageUrl}
        data-width="100%"
        data-numposts="5"
        data-mobile="true"
      />
    </div>
  );
}