// components/ClientLayout.jsx
'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import NewsTicker from "./NewsTicker";
import MobileMenu from "./MobileMenu";
import MobileShopFilterBar from "./MobileShopFilterBar";
import SidebarMiddleLayer from "./SidebarMiddleLayer";
import SidebarLeftLayer from "./SidebarLeftLayer";
import Breadcrumbs from "./Breadcrumbs";

/**
 * 🧱 ClientLayout – גרסה מעודכנת
 * -------------------------------------------------
 * - שומר על Header, NewsTicker, Footer, ו־MobileMenu הקיימים.
 * - מוסיף את שלושת הטורים (ימין 1/2, אמצע 1/4, שמאל 1/4).
 * - Breadcrumbs מוצג תמיד ומתעדכן לפי הנתיב.
 * - SidebarMiddleLayer ו־SidebarLeftLayer נטענים פעם אחת בלבד (Persist).
 */

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);

  // 📌 יצירת רשימת פירורים לפי הנתיב הנוכחי
  useEffect(() => {
    if (!pathname) return;
    const parts = pathname.split("/").filter(Boolean);
    const items = [{ label: "דף הבית", href: "/" }];
    let currentPath = "";
    parts.forEach((part) => {
      currentPath += `/${part}`;
      items.push({ label: decodeURIComponent(part), href: currentPath });
    });
    setBreadcrumbItems(items);
  }, [pathname]);

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

      {/* 🧭 פירורי לחם (Breadcrumbs) – קבועים בזיכרון, מתעדכנים לפי הנתיב */}
      <div className="w-full bg-gray-100 border-b border-[#e60000] py-1 px-3 sm:px-4 text-right">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* כפתור סינון מוצרים במובייל (בחנות בלבד) */}
      {isShopPage && <MobileShopFilterBar />}

      {/* 🌍 מבנה שלושת העמודות (שומר על יחסים 1/2 - 1/4 - 1/4) */}
      <div className="w-full max-w-[1440px] mx-auto bg-gray-100" dir="rtl">
        <main className="flex flex-col lg:flex-row min-h-screen">
          {/* 🟥 תוכן משתנה (כתבות / קטגוריות) */}
          {children}

          {/* 🟦 סיידר אמצעי – קבוע */}
          <div className="w-full lg:w-1/4 flex-shrink-0 px-0 py-0 border-l border-[#e60000]">
            <SidebarMiddleLayer />
          </div>

          {/* 🟩 סיידר שמאלי – קבוע */}
          <div className="w-full lg:w-1/4 flex-shrink-0 px-0 py-0 border-r border-[#e60000]">
            <SidebarLeftLayer />
          </div>
        </main>
      </div>

      {/* ⚫ פוטר */}
      <Footer />
    </>
  );
}
