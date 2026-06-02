// components/FacebookComments.jsx
'use client';
import { useEffect, useRef, useState } from 'react';

export default function FacebookComments({ url }) {
  const containerRef = useRef(null);
  const [pageUrl, setPageUrl] = useState('');

  // 1. קביעת הכתובת הנוכחית
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(url || window.location.href.split('?')[0]);
    }
  }, [url]);

  useEffect(() => {
    if (!pageUrl) return;

    // 2. פונקציה לבניית התגובות וקריאה לפייסבוק
    const renderFbComments = () => {
      if (containerRef.current && window.FB) {
        // מנקים את הקונטיינר לחלוטין ושותלים את האלמנט של פייסבוק מחדש
        // זה מונע מ-React לדרוס את ה-iframe שפייסבוק מייצר
        containerRef.current.innerHTML = `<div class="fb-comments" data-href="${pageUrl}" data-width="100%" data-numposts="5" data-mobile="true"></div>`;
        
        // פוקדים על פייסבוק לרנדר רק את הקונטיינר הזה
        window.FB.XFBML.parse(containerRef.current);
      }
    };

    // 3. אתחול מפורש של פייסבוק (מונע את רוב הבאגים ב-Next.js)
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '1702134291174147', // ה-App ID שלך
        cookie: true,
        xfbml: true,
        version: 'v19.0'
      });
      
      // ברגע שהאתחול הסתיים, מרנדרים את התגובות
      renderFbComments();
    };

    // 4. הזרקה ידנית של הסקריפט (עוקף את רכיב Script של Next)
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/he_IL/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    } else {
      // אם הסקריפט כבר נמצא (למשל במעבר מכתבה לכתבה), פשוט נרנדר מחדש
      if (window.FB) {
        renderFbComments();
      }
    }
  }, [pageUrl]);

  if (!pageUrl) return null;

  return (
    <div className="mt-4 w-full min-h-[200px]">
      {/* הקונטיינר שאליו מוזרק הקוד של פייסבוק.
        הוא ריק כדי למנוע התנגשויות ברינדור של React.
      */}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}