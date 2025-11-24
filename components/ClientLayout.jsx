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
import useIsMobile from "@/hooks/useIsMobile";

// 👇 הוספנו את tickerHeadlines כ-Prop
export default function ClientLayout({ children, tickerHeadlines = [] }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const [isAtTop, setIsAtTop] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(60);

  /* 📌 טעינת סקריפטים (טוויטר/טיקטוק) */
  useEffect(() => {
    const scripts = [
      { id: "twitter-embed-script", src: "https://platform.twitter.com/widgets.js" },
      { id: "tiktok-embed-script", src: "https://www.tiktok.com/embed.js" },
    ];

    scripts.forEach(({ id, src }) => {
      if (!document.getElementById(id)) {
        const script = document.createElement("script");
        script.id = id;
        script.async = true;
        script.src = src;
        script.start = src;
        document.body.appendChild(script);
      }
    });
  }, []);

  /* 📌 זיהוי גלילה במובייל */
  useEffect(() => {
    if (!isMobile) return;
    const onScroll = () => {
      setIsAtTop(window.scrollY < 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  /* 📌 חישוב גובה Header באופן דינמי */
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const updateHeight = () => {
      setHeaderHeight(header.getBoundingClientRect().height);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const isShopPage = pathname.startsWith("/shop");

  return (
    <>
      {/* 🍔 תפריט מובייל */}
      <div className="fixed top-4 right-0 z-[9999] lg:hidden">
        <MobileMenu />
      </div>

      <Header />

      {/* 📰 NewsTicker */}
      <div
        className={`
          ${isMobile
            ? (isAtTop
                // ✅ תיקון: הורדנו את ה-Z-Index ל-30 (במקום 9998) כדי שהתפריט יכסה אותו
                ? `sticky z-30`
                : "relative")
            // ✅ תיקון גם בדסקטופ: z-30
            : `sticky z-30`
          }
        `}
        style={{
          top: isMobile ? (isAtTop ? headerHeight : 0) : headerHeight,
        }}
      >
        {/* 👇 מעבירים את הנתונים לטיקר */}
        <NewsTicker headlines={tickerHeadlines} />
      </div>

      {isShopPage && <MobileShopFilterBar />}

      {/* 🌍 פריסת העמוד */}
      <div className="w-screen sm:w-full overflow-x-hidden sm:overflow-visible bg-[#f9f9f9]" dir="rtl">
        <main
          className={`min-h-screen flex flex-col max-w-[1440px] mx-auto mb-0 px-0 sm:px-0 pt-[1px] pb-[2px] text-right bg-gray-100
            ${isShopPage ? '' : 'lg:flex-row'}
          `}
        >
          {/* תוכן מרכזי */}
          {children}

          {/* סיידרים – מוצגים רק אם זה לא shop */}
          {!isShopPage && (
            <>
              <div className={`w-full lg:w-1/4 flex-shrink-0 px-0 sm:px-0 ${!isMobile ? 'border-l border-[#e60000]' : ''}`}>
                <SidebarMiddleLayer />
              </div>

              <div className={`w-full lg:w-1/4 flex-shrink-0 px-0 sm:px-0 ${!isMobile ? 'border-r border-[#e60000]' : ''}`}>
                <SidebarLeftLayer />
              </div>
            </>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}