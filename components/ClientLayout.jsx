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
 * 🧱 ClientLayout – מבנה אתר OnMotor Media
 * -------------------------------------------------
 * ✅ Desktop: 1/4 (ימין - SidebarLeftLayer)
 *             1/4 (אמצע - SidebarMiddleLayer)
 *             1/2 (שמאל - תוכן ראשי)
 * ✅ Mobile: אנכי (שלוש שכבות אחת מתחת לשנייה)
 */

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // 🟢 טעינת סקריפטים חיצוניים (Facebook / Twitter / TikTok)
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

      {/* 🔺 הדר וניוז טיקר */}
      <Header />
      <NewsTicker />

      {/* כפתור סינון בחנות בלבד */}
      {isShopPage && <MobileShopFilterBar />}

      {/* 🔵 שלושת הבלוקים - פריסת דסקטופ ומובייל */}
      <div className="w-full flex flex-col lg:flex-row-reverse min-h-screen bg-gray-100">

        {/* 🟥 סיידר ימין (קבוע) */}
        <div
          className={`w-full lg:w-1/4 flex-shrink-0 px-0 py-0 border-l border-[#e60000]`}
        >
          <SidebarLeftLayer />
        </div>

        {/* 🟧 סיידר אמצעי */}
        <div
          className={`w-full lg:w-1/4 flex-shrink-0 px-0 py-0 border-l border-[#e60000]`}
        >
          <SidebarMiddleLayer />
        </div>

        {/* 🟩 תוכן ראשי (1/2 מהמסך) */}
        <div className="w-full lg:w-1/2 flex-shrink-0 px-0 py-0">
          <div className="sticky top-[70px]">
            {children}
          </div>
        </div>
      </div>

      {/* ⚫ פוטר */}
      <Footer />
    </>
  );
}
