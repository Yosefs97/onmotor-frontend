// components/FacebookComments.jsx
'use client';
import { useEffect, useRef, useState } from 'react';

export default function FacebookComments({ url }) {
  const containerRef = useRef(null);
  const [pageUrl, setPageUrl] = useState('');

  // קביעת הכתובת שעליה מגיבים (מזהה הכתבה)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(url || window.location.href.split('?')[0]);
    }
  }, [url]);

  useEffect(() => {
    if (!pageUrl) return;

    const renderFbComments = () => {
      if (containerRef.current && window.FB) {
        // מנקים את הקונטיינר ושותלים את אלמנט התגובות מחדש
        containerRef.current.innerHTML = `<div class="fb-comments w-full" data-href="${pageUrl}" data-width="100%" data-numposts="5" data-mobile="true"></div>`;
        
        // מורים לפייסבוק לסרוק ולרנדר את הדיב
        window.FB.XFBML.parse(containerRef.current);
      }
    };

    // הגדרת פונקציית האתחול הרשמית של פייסבוק
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '1702134291174147',
        cookie: true,
        xfbml: true,
        version: 'v19.0'
      });
      
      renderFbComments();
    };

    // הזרקת הסקריפט של ה-SDK לעמוד אם הוא עדיין לא קיים
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/he_IL/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    } else {
      // אם הסקריפט כבר שם (במעבר בין כתבות), פשוט נרנדר שוב
      if (window.FB) {
        renderFbComments();
      }
    }
  }, [pageUrl]);

  if (!pageUrl) return null;

  return (
    <div className="mt-2 w-full min-h-[150px]">
      {/* הקונטיינר אליו אנחנו מזריקים את פייסבוק */}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}