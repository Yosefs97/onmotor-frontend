// components/FacebookComments.jsx
'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function FacebookComments({ url }) {
  const [pageUrl, setPageUrl] = useState('');

  // 1. הגדרת הכתובת שעליה מגיבים
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // עדיף להשתמש קודם כל ב-url שהועבר מ-CommentsSection
      setPageUrl(url || window.location.href.split('?')[0]);
    }
  }, [url]);

  // 2. פונקציה שתופעל בדיוק כשהסקריפט של פייסבוק יסיים להיטען
  const handleFacebookLoad = () => {
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  };

  // 3. תמיכה במעבר בין עמודים (SPA)
  useEffect(() => {
    if (pageUrl && window.FB) {
      window.FB.XFBML.parse();
    }
  }, [pageUrl]);

  return (
    <div className="mt-2">
      {/* טעינת הסקריפט של פייסבוק.
        השפה כאן היא he_IL (עברית). 
        אסטרטגיית lazyOnload מבטיחה שהאתר שלך לא יואט בגלל פייסבוק.
      */}
      <Script
        src="https://connect.facebook.net/he_IL/sdk.js#xfbml=1&version=v19.0"
        strategy="lazyOnload"
        onLoad={handleFacebookLoad}
        crossOrigin="anonymous"
      />

      {/* הקונטיינר של פייסבוק - חשוב שהוא יהיה קיים ב-DOM כשהפונקציה parse רצה */}
      {pageUrl && (
        <div
          className="fb-comments"
          data-href={pageUrl}
          data-width="100%"
          data-numposts="5"
          data-order-by="reverse_time"
          data-mobile="true"
        />
      )}
    </div>
  );
}