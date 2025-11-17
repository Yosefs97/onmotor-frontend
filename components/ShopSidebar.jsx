// /components/ShopSidebar.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DropdownSimple from './DropdownSimple';
import { buildUrlFromFilters } from '@/utils/buildUrlFromFilters';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function ShopSidebar({ onFilterChange = () => {}, product = null, scrollRef }) {
  const [facets, setFacets] = useState({
    vendors: [],
    models: {},
    yearsByModel: {},
    categoriesByModel: {},
  });

  const [filters, setFilters] = useState({
    q: '',
    sku: '',
    vendor: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    category: '',
  });

  // 🔥 שליטה בפתיחה אוטומטית של השורה הבאה
  const [autoOpenModel, setAutoOpenModel] = useState(false);
  const [autoOpenYear, setAutoOpenYear] = useState(false);
  const [autoOpenCategory, setAutoOpenCategory] = useState(false);

  const [yearRange, setYearRange] = useState([0, 0]);
  const [cursor, setCursor] = useState([0, 0]);

  const router = useRouter();
  const pathname = usePathname();

  const scrollToElement = (id) => {
    if (typeof window === "undefined") return;
    if (!scrollRef?.current) return;

    if (window.innerWidth < 1024) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/shopify/facets');
      const json = await res.json();
      setFacets(json || {});
    })();
  }, []);

  // update year range when model changes
  useEffect(() => {
    const list = facets.yearsByModel[filters.model?.toLowerCase?.() || ''] || [];
    if (list.length) {
      const min = parseInt(list[0], 10);
      const max = parseInt(list[list.length - 1], 10);

      setYearRange([min, max]);
      setCursor([min, max]);
      setFilters(f => ({ ...f, yearFrom: String(min), yearTo: String(max) }));

      setAutoOpenYear(true);
      setTimeout(() => scrollToElement("filter-year"), 150);
    }
  }, [filters.model, facets.yearsByModel]);

  const applyFilters = () => {
    const payload = { ...filters, yearFrom: String(cursor[0]), yearTo: String(cursor[1]) };
    onFilterChange(payload);

    const url = buildUrlFromFilters(payload, pathname, product);
    router.push(url, { scroll: false });
  };

  // 🔥 בחירת יצרן → פותח דגם + גלילה
  const handleVendorChange = (val) => {
    setFilters((f) => ({
      ...f,
      vendor: val,
      model: '',
      yearFrom: '',
      yearTo: '',
      category: '',
      q: '',
      sku: '',
    }));

    setAutoOpenModel(true);

    setTimeout(() => scrollToElement("filter-model"), 150);
  };

  return (
    <aside dir="rtl" className="space-y-2 sticky top-20 p-4 bg-white text-red-600 border border-red-600 rounded-md">
      
      <h3 className="font-extrabold text-2xl border-b border-red-600 pb-2">סינון מוצרים</h3>

      <motion.a
        href="https://wa.me/972522304604"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition mb-3"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <MessageCircle className="w-5 h-5" />
        <span>לחלק ספציפי - צרו קשר בווטסאפ</span>
      </motion.a>

      {/* חיפוש */}
      <div className="space-y-1">
        <label className="text-lg font-bold">חיפוש לפי מק"ט/חופשי</label>
        <input
          type="text"
          placeholder="לדוגמה: פילטר שמן או מק'ט"
          value={filters.q}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              q: e.target.value,
              vendor: '',
              model: '',
              yearFrom: '',
              yearTo: '',
              category: '',
            }))
          }
          className="w-full border border-red-600 bg-white text-red-600 rounded-md p-2 text-lg placeholder-red-400"
        />
      </div>

      {/* יצרן */}
      <DropdownSimple
        id="filter-vendor"
        label="יצרן"
        value={filters.vendor}
        options={facets.vendors || []}
        onChange={handleVendorChange}
        forceOpen={false}
      />

      {/* דגם */}
      {filters.vendor && (
        <DropdownSimple
          id="filter-model"
          label="דגם"
          value={filters.model}
          options={facets.models[filters.vendor] || []}
          onChange={(val) => {
            setFilters((f) => ({ ...f, model: val, category: '' }));
            setAutoOpenYear(true);
            setTimeout(() => scrollToElement("filter-year"), 150);
          }}
          forceOpen={autoOpenModel}
        />
      )}

      {/* טווח שנים */}
      {filters.model && yearRange[0] > 0 && (
        <div id="filter-year" className="space-y-2">
          <label className="text-lg font-bold">טווח שנים</label>

          <div className="flex gap-2">
            <input
              type="range"
              min={yearRange[0]}
              max={yearRange[1]}
              value={cursor[0]}
              onChange={(e) =>
                setCursor(([_, r]) => [Math.min(parseInt(e.target.value), r), r])
              }
              className="w-full"
            />
            <span>{cursor[0]}</span>
          </div>

          <div className="flex gap-2">
            <input
              type="range"
              min={yearRange[0]}
              max={yearRange[1]}
              value={cursor[1]}
              onChange={(e) =>
                setCursor(([l, _]) => [l, Math.max(parseInt(e.target.value), l)])
              }
              className="w-full"
            />
            <span>{cursor[1]}</span>
          </div>

          <div className="text-xs text-gray-600">נבחר: {cursor[0]} - {cursor[1]}</div>
        </div>
      )}

      {/* קטגוריה */}
      {filters.model && (
        <DropdownSimple
          id="filter-category"
          label="קטגוריה"
          value={filters.category}
          options={facets.categoriesByModel[filters.model] || []}
          onChange={(val) => {
            setFilters((f) => ({ ...f, category: val }));
            setAutoOpenCategory(true);
            setTimeout(() => scrollToElement("filter-submit-btn"), 150);
          }}
          forceOpen={autoOpenCategory}
        />
      )}

      {/* כפתור חפש */}
      <button
        id="filter-submit-btn"
        onClick={applyFilters}
        className="w-full mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-md"
      >
        חפש
      </button>
    </aside>
  );
}
