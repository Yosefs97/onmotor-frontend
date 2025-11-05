// components/ClientLayout.jsx
'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import useIsMobile from "@/hooks/useIsMobile";
import Header from "./Header";
import Footer from "./Footer";
import NewsTicker from "./NewsTicker";
import MobileMenu from "./MobileMenu";
import MobileShopFilterBar from "./MobileShopFilterBar";
import SidebarMiddleLayer from "./SidebarMiddleLayer";
import SidebarLeftLayer from "./SidebarLeftLayer";

/**
 * 🧱 ClientLayout – פריסת 1/2 + 1/4 + 1/4 מדויקת (כמו PageContainer)
 * ---------------------------------------------------------
 * ✅ Desktop:
 *   תוכן עיקרי (ימין, 1/2)
 *   סיידר אמצעי (מרכז, 1/4)
 *   סיידר שמאלי (שמאל, 1/4)
 * ✅ Mobile:
 *   בלוקים אנכיים (אחד מתחת לשני)
 */

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  useEffect(() => {
    const scripts = [
      {
        id: "facebook-embed-script",
        src: "https://connect.facebook.net/he_IL/sdk.js#xfbml=1&version=v18.0",
      },
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

      {/* הדר וחדשות */}
      <Header />
      <NewsTicker />

      {isShopPage && <MobileShopFilterBar />}

      {/* ⚙️ פריסת שלושת העמודות */}
      <div className="w-screen sm:w-full overflow-x-hidden sm:overflow-visible bg-[#f9f9f9]" dir="rtl">
        <main className="min-h-screen flex flex-col lg:flex-row-reverse text-right mb-0 px-0 sm:px-0 pt-[1px] pb-[2px] bg-gray-100">
          
          {/* 🟥 תוכן ראשי (ימין) */}
          <div className="w-full lg:w-1/2 flex-shrink-0 px-0 py-0 lg:border-l border-[#e60000]">
            <div className="sticky top-[70px]">
              {children}
            </div>
          </div>

          {/* 🟦 סיידר אמצעי */}
          <div
            className={`w-full lg:w-1/4 flex-shrink-0 px-0 py-0 ${
              !isMobile ? 'border-l border-[#e60000]' : ''
            }`}
          >
            <SidebarMiddleLayer />
          </div>

          {/* 🟩 סיידר שמאלי */}
          <div
            className={`w-full lg:w-1/4 flex-shrink-0 px-0 py-0 ${
              !isMobile ? 'border-r border-[#e60000]' : ''
            }`}
          >
            <SidebarLeftLayer />
          </div>
        </main>
      </div>

      {/* ⚫ פוטר */}
      <Footer />
    </>
  );
}
