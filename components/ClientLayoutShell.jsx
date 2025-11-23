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

export default function ClientLayoutShell({ children }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isAtTop, setIsAtTop] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(60);

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
        document.body.appendChild(script);
      }
    });
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const onScroll = () => {
      setIsAtTop(window.scrollY < 10);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

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
      <div className="fixed top-4 right-0 z-[9999] lg:hidden">
        <MobileMenu />
      </div>

      <Header />

      <div
        className={`${
          isMobile ? (isAtTop ? "sticky z-[9998]" : "relative") : "sticky z-[9998]"
        }`}
        style={{
          top: isMobile ? (isAtTop ? headerHeight : 0) : headerHeight,
        }}
      >
        <NewsTicker />
      </div>

      {isShopPage && <MobileShopFilterBar />}

      <div className="w-screen sm:w-full overflow-x-hidden bg-[#f9f9f9]" dir="rtl">
        <main
          className={`min-h-screen flex flex-col max-w-[1440px]
            mx-auto mb-0 text-right bg-gray-100
            ${isShopPage ? "" : "lg:flex-row"}
          `}
        >
          {children}

          {!isShopPage && (
            <>
              <div className={`w-full lg:w-1/4 flex-shrink-0 ${!isMobile ? "border-l border-[#e60000]" : ""}`}>
                <SidebarMiddleLayer />
              </div>

              <div className={`w-full lg:w-1/4 flex-shrink-0 ${!isMobile ? "border-r border-[#e60000]" : ""}`}>
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
