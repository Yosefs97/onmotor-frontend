// components/FacebookSDKLoader.jsx
'use client';
import { useEffect } from 'react';

export default function FacebookSDKLoader() {
  useEffect(() => {
    // אם כבר נטען, אין צורך שוב
    if (window.FB) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '1702134291174147', // 🔴 כאן תכניס את ה־App ID שלך מ-Facebook Developers
        xfbml: true,
        version: 'v21.0',
      });
    };

    // טוען את ה־SDK
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
