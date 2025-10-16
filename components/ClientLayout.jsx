// /components/ClientLayout.jsx
'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import NewsTicker from "./NewsTicker";
import MobileMenu from './MobileMenu';
import MobileShopFilterBar from "./MobileShopFilterBar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    // Facebook SDK
    if (!document.getElementById("facebook-embed-script")) {
      const scriptFb = document.createElement('script');
      scriptFb.id = "facebook-embed-script";
      scriptFb.src = "https://connect.facebook.net/he_IL/sdk.js#xfbml=1&version=v18.0";
      scriptFb.async = true;
      scriptFb.defer = true;
      scriptFb.crossOrigin = "anonymous";
      document.body.appendChild(scriptFb);
    }

    // Twitter/X
    if (!document.getElementById("twitter-embed-script")) {
      const scriptTw = document.createElement('script');
      scriptTw.id = "twitter-embed-script";
      scriptTw.async = true;
      scriptTw.src = "https://platform.twitter.com/widgets.js";
      document.body.appendChild(scriptTw);
    }

    // TikTok
    if (!document.getElementById("tiktok-embed-script")) {
      const scriptTt = document.createElement('script');
      scriptTt.id = "tiktok-embed-script";
      scriptTt.async = true;
      scriptTt.src = "https://www.tiktok.com/embed.js";
      document.body.appendChild(scriptTt);
    }
  }, []);

  const isShopPage = pathname.startsWith("/shop");

  return (
    <>
      {/* כפתור ההמבורגר כאן – מחוץ להדר */}
      <div className="fixed top-4 right-0 z-[9999] lg:hidden">
        <MobileMenu />
      </div>

      <Header />
      <NewsTicker />

      {/* כפתור "מנוע סינון מוצרים" במובייל – יוצג רק בחנות */}
      {isShopPage && <MobileShopFilterBar />}

      {/* קונטיינר מרכזי */}
      <div className="w-full max-w-[1440px] mx-auto">
        <main className="bg-gray-100 min-h-screen" dir="rtl">
          <div className="w-full">{children}</div>
        </main>
      </div>

      <Footer />
    </>
  );
}
