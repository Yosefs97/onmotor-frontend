// components/FacebookComments.jsx
'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function FacebookComments({ url }) {
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(url || window.location.href.split('?')[0]);
    }
  }, [url]);

  const initFacebook = () => {
    // וידוא שהאובייקט של פייסבוק קיים לפני שמנסים לרנדר
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  };

  useEffect(() => {
    if (pageUrl && window.FB) {
      window.FB.XFBML.parse();
    }
  }, [pageUrl]);

  return (
    <div className="mt-2 w-full">
      {/* 1. חובה: אלמנט שפייסבוק דורש כדי לפעול */}
      <div id="fb-root"></div>

      {/* 2. שינינו ל-afterInteractive */}
      <Script
        src="https://connect.facebook.net/he_IL/sdk.js#xfbml=1&version=v19.0"
        strategy="afterInteractive"
        onLoad={initFacebook}
        crossOrigin="anonymous"
      />

      {/* 3. הקונטיינר של התגובות */}
      {pageUrl && (
        <div
          className="fb-comments w-full"
          data-href={pageUrl}
          data-width="100%"
          data-numposts="5"
          data-mobile="true"
        />
      )}
    </div>
  );
}