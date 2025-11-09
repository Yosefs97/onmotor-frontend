// components/FacebookComments.jsx
'use client';
import { useEffect, useState } from 'react';

export default function FacebookComments({ url }) {
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    // נוודא שתמיד משתמשים ב־URL מדויק של הדפדפן (כולל פרמטרים)
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.origin + window.location.pathname;
      setPageUrl(currentUrl);
    }
  }, []);

  useEffect(() => {
    if (!pageUrl) return;

    // אם ה־SDK קיים – מבצע parse
    if (window.FB && window.FB.XFBML) {
      window.FB.XFBML.parse();
    } else {
      // מאזין לטעינת ה־SDK
      const checkFB = setInterval(() => {
        if (window.FB && window.FB.XFBML) {
          window.FB.XFBML.parse();
          clearInterval(checkFB);
        }
      }, 500);
      return () => clearInterval(checkFB);
    }
  }, [pageUrl]);

  return (
    <div className="mt-8">
      <div
        className="fb-comments"
        data-href={pageUrl || url}
        data-width="100%"
        data-numposts="5"
        data-order-by="reverse_time"
        data-mobile="true"
      />
    </div>
  );
}
