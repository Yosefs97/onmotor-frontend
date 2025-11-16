// components/FacebookSDKLoader.jsx
'use client';
import { useEffect } from 'react';

export default function FacebookSDKLoader() {
  useEffect(() => {

    // ⚠️ לא בודקים window.FB — רק אם הסקריפט קיים
    if (document.getElementById('facebook-jssdk')) return;

    // תמיד מגדירים fbAsyncInit לפני טעינה
    window.fbAsyncInit = function () {
      if (!window.FB) return;

      try {
        window.FB.init({
          appId: '1702134291174147',
          xfbml: true,
          version: 'v20.0',   // ← גרסה יציבה (פתרון ידוע לבעיה)
        });
      } catch (err) {
        console.error("❌ FB.init failed:", err);
      }
    };

    // טעינת SDK רק פעם אחת
    (function (d, s, id) {
      let js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/he_IL/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');

  }, []);

  return null;
}
