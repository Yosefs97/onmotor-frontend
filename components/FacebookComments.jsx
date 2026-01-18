// components/FacebookComments.jsx
'use client';
import { useEffect, useState } from 'react';

export default function FacebookComments({ url }) {
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.origin + window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!pageUrl) return;

    // SDK עדיין לא נטען? אל תעשה כלום!
    if (!window.FB || !window.FB.XFBML) return;

    // SDK נטען בצורה מלאה → עכשיו מותר parse
    window.FB.XFBML.parse();

  }, [pageUrl]);

  return (
    <div className="mt-2">
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
