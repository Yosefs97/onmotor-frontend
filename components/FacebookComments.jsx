// components/FacebookComments.jsx
'use client';
import { useEffect, useRef } from 'react';

export default function FacebookComments({ url }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // למטרת הבדיקה בלבד! נסה קודם כל עם הכתובת של פייסבוק.
    // אם זה עובד, שים // לפני השורה הזו ותוריד את ה-// מהשורה שמתחתיה.
    const actualUrl = 'https://developers.facebook.com/docs/plugins/comments/';
    // const actualUrl = url || window.location.href.split('?')[0];

    let timeoutId;

    const renderComments = () => {
      if (containerRef.current && window.FB) {
        // 1. מנקים את הקונטיינר לחלוטין כדי למנוע התנגשויות עם React
        containerRef.current.innerHTML = '';

        // 2. יוצרים את האלמנט של פייסבוק בעזרת JS טהור
        const fbDiv = document.createElement('div');
        fbDiv.className = 'fb-comments';
        fbDiv.setAttribute('data-href', actualUrl);
        fbDiv.setAttribute('data-width', '100%');
        fbDiv.setAttribute('data-numposts', '5');
        fbDiv.setAttribute('data-mobile', 'true');

        // 3. שותלים אותו בקונטיינר
        containerRef.current.appendChild(fbDiv);

        // 4. אומרים לפייסבוק לסרוק רק את הקונטיינר הספציפי הזה
        window.FB.XFBML.parse(containerRef.current);
      } else if (!window.FB) {
        // אם ה-SDK עדיין לא מוכן, ננסה שוב עוד חצי שנייה
        timeoutId = setTimeout(renderComments, 500);
      }
    };

    // מתחילים את התהליך עם השהייה קלה
    timeoutId = setTimeout(renderComments, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [url]);

  return (
    // הוספתי גבול אדום מקווקו רק כדי שתראה בעין איפה הקונטיינר יושב
    <div 
      className="mt-4 w-full min-h-[250px] border-2 border-dashed border-red-300" 
      ref={containerRef} 
    />
  );
}