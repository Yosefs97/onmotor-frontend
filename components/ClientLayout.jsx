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

export default function ClientLayout({ children }) {
  const pathname = usePathname();

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
      <div className="fixed top-4 right-0 z-[9999] lg:hidden">
        <MobileMenu />
      </div>

      <Header />
      <NewsTicker />
      {isShopPage && <MobileShopFilterBar />}

      <div className="w-full max-w-[1440px] mx-auto bg-gray-100" dir="rtl">
        <main className="flex flex-col lg:flex-row min-h-screen">
          {/* תוכן ראשי */}
          <div className="w-full lg:w-1/2">{children}</div>

          {/* סיידר אמצעי – רק בדסקטופ */}
          <div className="hidden lg:block lg:w-1/4 flex-shrink-0 border-l border-[#e60000]">
            <SidebarMiddleLayer />
          </div>

          {/* סיידר שמאלי – רק בדסקטופ */}
          <div className="hidden lg:block lg:w-1/4 flex-shrink-0 border-r border-[#e60000]">
            <SidebarLeftLayer />
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
