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

/**
 * 🧱 ClientLayout – גרסה רספונסיבית מתוקנת
 * -------------------------------------------------
 * ✅ שומר על Header, NewsTicker, Footer ו־MobileMenu הקיימים
 * ✅ במובייל – הסיידרים מוסתרים, והתוכן תופס 100% רוחב
 * ✅ ב־Desktop – נשמר יחס 1/2 (תוכן) + 1/4 (אמצעי) + 1/4 (שמאלי)
 * ✅ ללא רווחים בצדדים או מתיחה מיותרת בגובה
 */

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // 🟢 טעינת סקריפטים חיצוניים (פייסבוק, טוויטר, טיקטוק)
  useEffect(() => {
    const scripts = [
      {
        id: "facebook-embed-script",
        src: "https://connect.facebook.net/he_IL/sdk.js#xfbml=1&version=v18.0",
      },
      {
        id: "twitter-embed-script",
        src: "https://platform.twitter.com/widgets.js",
      },
      {
        id: "tiktok-embed-script",
        src: "https://www.tiktok.com/embed.js",
      },
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
      {/* 🍔 כפתור ההמבורגר במובייל */}
      <div className="fixed top-4 right-0 z-[9999] lg:hidden">
        <MobileMenu />
      </div>

      {/* 🔺 הדר עליון */}
      <Header />
      <NewsTicker />

      {/* כפתור סינון מוצרים במובייל (בחנות בלבד) */}
      {isShopPage && <MobileShopFilterBar />}

      {/* 🌍 פריסת שלושת העמודות */}
      <div className="w-full max-w-[1440px] mx-auto bg-gray-100" dir="rtl">
        <main className="flex flex-col lg:flex-row w-full min-h-fit lg:min-h-screen">
          {/* 🟥 תוכן משתנה (כתבות / קטגוריות) */}
          <div className="w-full">{children}</div>

          {/* 🟦 סיידר אמצעי – מוצג רק בדסקטופ */}
          <div className="hidden lg:block w-1/4 border-l border-[#e60000]">
            <SidebarMiddleLayer />
          </div>

          {/* 🟩 סיידר שמאלי – מוצג רק בדסקטופ */}
          <div className="hidden lg:block w-1/4 border-r border-[#e60000]">
            <SidebarLeftLayer />
          </div>
        </main>
      </div>

      {/* ⚫ פוטר */}
      <Footer />
    </>
  );
}
