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
import useIsMobile from '@/hooks/useIsMobile';


/**
 * 🧱 ClientLayout – גרסה לאחר הסרת Breadcrumbs
 * -------------------------------------------------
 * - שומר על Header, NewsTicker, Footer, ו־MobileMenu הקיימים.
 * - כולל רק את הסיידרים הקבועים.
 * - Breadcrumbs מטופלים מעתה ב־PageContainer.jsx בלבד.
 * - SidebarMiddleLayer ו־SidebarLeftLayer נטענים פעם אחת בלבד (Persist).
 */

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  

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

     <div className="w-full flex flex-col lg:flex-row min-h-screen bg-gray-100">
          
          {/* ✅ תוכן ראשי – Sticky */}
          <div className="w-full lg:w-1/2 flex-shrink-0 px-0 py-0 lg:border-l border-[#e60000]">
            <div className="sticky top-[70px]"> 
              {children}
            </div>
          </div>

          {/* סיידר אמצעי */}
          <div
            className={`w-full lg:w-1/4 flex-shrink-0 px-0 py-0 ${
              !isMobile ? 'border-l border-[#e60000]' : ''
            }`}
          >
            <SidebarMiddleLayer />
          </div>

          {/* סיידר שמאלי */}
          <div
            className={`w-full lg:w-1/4 flex-shrink-0 px-0 py-0 ${
              !isMobile ? 'border-r border-[#e60000]' : ''
            }`}
          >
            <SidebarLeftLayer />
          </div>
    

      {/* ⚫ פוטר */}
      <Footer />
    </div>
    </>
  );
}
