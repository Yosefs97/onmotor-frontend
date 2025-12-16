// /components/MobileShopFilterBar.jsx
"use client";
import { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import ShopSidebar from "./ShopSidebar";
import { buildUrlFromFilters } from "@/utils/buildUrlFromFilters";

export default function MobileShopFilterBar({ onFilterChange = () => {}, product = null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const scrollRef = useRef(null);

  const applyFilters = (f) => {
    onFilterChange(f);
    const url = buildUrlFromFilters(f, pathname, product);
    router.push(url, { scroll: false });
    setOpen(false);
  };

  return (
    <>
      {/* הכפתור החדש - סטטי, ללא אנימציה, טקסט אנכי */}
      <button
        onClick={() => setOpen(true)}
        className="
            md:hidden 
            flex items-center justify-center 
            bg-red-600 text-white 
            h-[50px] w-[80px] 
            rounded-lg shadow-sm 
            border border-red-700
            active:bg-red-700
        "
        aria-label="פתח סינון"
      >
        {/* טקסט אנכי */}
        <span className="text-[15px] leading-3 font-bold text-center block w-full px-1">
         מנוע סינון<br/>חכם
        </span>
      </button>

      {/* המודאל נשאר כמו שהיה (קופץ על כל המסך) */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-start pt-16 z-[9999]">
          <div
            ref={scrollRef}
            className="bg-white rounded-lg px-4 pt-6 pb-2 w-11/12 h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="font-bold text-red-600 text-lg">מנוע סינון מוצרים</h2>
              <button 
                onClick={() => setOpen(false)} 
                className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <ShopSidebar onFilterChange={applyFilters} scrollRef={scrollRef} />
          </div>
        </div>
      )}
    </>
  );
}