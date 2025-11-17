// /components/MobileShopFilterBar.jsx
"use client";
import { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import ShopSidebar from "./ShopSidebar";
import { buildUrlFromFilters } from "@/utils/buildUrlFromFilters";

export default function MobileShopFilterBar({ onFilterChange = () => {}, product = null }) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const router = useRouter();
  const pathname = usePathname();

  // 🔥 כאן — ref לגלילה פנימית
  const scrollRef = useRef(null);

  const applyFilters = (f) => {
    setFilters(f);
    onFilterChange(f);

    const url = buildUrlFromFilters(f, pathname, product);
    router.push(url, { scroll: false });

    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`fixed top-50 z-50 px-4 py-1 rounded-md shadow-lg md:hidden transition-all duration-300 
          ${open ? "left-10 bg-gray-800" : "left-0 bg-red-600"} text-white animate-parts-bounce`}
      >
        {open ? "✕" : "סינון"}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-start pt-16 z-50">
          <div
            ref={scrollRef}
            className="bg-white rounded-lg px-4 pt-6 pb-2 w-11/12 h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-red-600">מנוע סינון מוצרים</h2>
              <button onClick={() => setOpen(false)} className="text-red-600 font-bold">
                ✕
              </button>
            </div>

            {/* 🔥 העברנו את ה־ref ל־ShopSidebar */}
            <ShopSidebar onFilterChange={applyFilters} scrollRef={scrollRef} />
          </div>
        </div>
      )}
    </>
  );
}
