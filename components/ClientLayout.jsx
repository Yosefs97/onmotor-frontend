// components/ClientLayout.jsx
'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import NewsTicker from "./NewsTicker";
import MobileMenu from "./MobileMenu";
import MobileShopFilterBar from "./MobileShopFilterBar";
import SidebarMiddleLayer from "./SidebarMiddleLayer";
import SidebarLeftLayer from "./SidebarLeftLayer";
import useIsMobile from "@/hooks/useIsMobile";

/**
 * 🧱 ClientLayout – גרסה מאוזנת ומדויקת:
 * -------------------------------------------------
 * ✅ Desktop: תוכן ראשי 1/2, סיידר אמצעי 1/4, סיידר שמאלי 1/4
 * ✅ Mobile: בלוקים אנכיים ללא רווחים צדדיים
 */

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  useEffect(() => {
    const scripts = [
      { id: "facebook-embed-script", src: "https://connect.facebook.net/he_IL/sdk.js#xfbml=1&version=v18.0" },
      { id: "twitter-embed-script", src: "https://platform.twitter.com/widgets.js" },
      { id: "tiktok-embed-script", src: "https://www.tiktok.com/embed.js" },
    ];
    scripts.forEach(({ id, src }) => {
      if (!document.getElementById(id)) {
        const script = document.createElement("script");
        script.id = id;
        script.async = true;
        script.src = src;
        document.body.appendChild(script);
      }
    });
  }, []);

  const isShopPage = pathname.startsWith("/shop");

  return (
    <>
      {/* 🍔 תפריט מובייל */}
      <div className="fixed top-4 right-0 z-[9999] lg:hidden">
        <MobileMenu />
      </div>

      <Header />
      <NewsTicker />
      {isShopPage && <MobileShopFilterBar />}

      {/* 🌍 פריסת שלושת העמודות */}
      <div className="w-screen sm:w-full overflow-x-hidden sm:overflow-visible bg-[#f9f9f9]" dir="rtl">
        <main className="min-h-screen flex flex-col max-w-[1440px] mx-auto lg:flex-row mb-0 px-0 sm:px-0 pt-[1px] pb-[2px] text-right bg-gray-100">
          {children}
          

          {/* 🟦 סיידר אמצעי – 1/4 */}
          <div className={`w-full lg:w-1/4 flex-shrink-0 px-0 sm:px-0 ${!isMobile ? 'border-l border-[#e60000]' : ''}`}>
            <SidebarMiddleLayer />
          </div>

          {/* 🟩 סיידר שמאלי – 1/4 */}
          <div className={`w-full lg:w-1/4 flex-shrink-0 px-0 sm:px-0 ${!isMobile ? 'border-r border-[#e60000]' : ''}`}>
            <SidebarLeftLayer />
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
