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
 * פריסת 1/2 + 1/4 + 1/4 מדויקת (RTL)
 * - קיבוע basis לכל עמודה + min-w-0 כדי למנוע דחיפה של התוכן הראשי.
 * - גבולות רק בדסקטופ.
 */
export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  useEffect(() => {
    const scripts = [
      { id: "facebook-embed-script", src: "https://connect.facebook.net/he_IL/sdk.js#xfbml=1&version=v18.0" },
      { id: "twitter-embed-script",  src: "https://platform.twitter.com/widgets.js" },
      { id: "tiktok-embed-script",   src: "https://www.tiktok.com/embed.js" },
    ];
    scripts.forEach(({ id, src }) => {
      if (!document.getElementById(id)) {
        const s = document.createElement("script");
        s.id = id; s.async = true; s.src = src;
        document.body.appendChild(s);
      }
    });
  }, []);

  const isShopPage = pathname.startsWith("/shop");

  return (
    <>
      {/* 🍔 מובייל */}
      <div className="fixed top-4 right-0 z-[9999] lg:hidden"><MobileMenu /></div>

      <Header />
      <NewsTicker />
      {isShopPage && <MobileShopFilterBar />}

      {/* 🎯 שלוש עמודות – RTL */}
      <div className="w-screen sm:w-full overflow-x-hidden sm:overflow-visible bg-[#f9f9f9]" dir="rtl">
        <main className="min-h-screen flex flex-col lg:flex-row-reverse text-right mb-0 px-0 sm:px-0 pt-[1px] pb-[2px] bg-gray-100">

          {/* 🟥 תוכן ראשי (ימין) – basis קבוע + min-w-0 */}
          <div className="min-w-0 px-0 py-0 lg:border-l border-[#e60000] lg:flex-[0_0_50%] w-full">
            <div className="sticky top-[70px]">
              {children}
            </div>
          </div>

          {/* 🟦 סיידר אמצעי – basis 25% + min-w-0 */}
          <div className={`min-w-0 px-0 py-0 lg:flex-[0_0_25%] w-full ${!isMobile ? 'lg:border-l border-[#e60000]' : ''}`}>
            <SidebarMiddleLayer />
          </div>

          {/* 🟩 סיידר שמאלי – basis 25% + min-w-0 */}
          <div className={`min-w-0 px-0 py-0 lg:flex-[0_0_25%] w-full ${!isMobile ? 'lg:border-r border-[#e60000]' : ''}`}>
            <SidebarLeftLayer />
          </div>

        </main>
      </div>

      <Footer />
    </>
  );
}
