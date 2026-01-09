// /components/ShopSidebar.jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import DropdownSimple from './DropdownSimple';
import { buildUrlFromFilters } from '@/utils/buildUrlFromFilters';
import { motion } from 'framer-motion';
import { MessageCircle, Loader2 } from 'lucide-react';
import MainCategoriesGrid from './MainCategoriesGrid'; // 👈 התוספת החדשה

export default function ShopSidebar({ 
  onFilterChange = () => {}, 
  product = null, 
  scrollRef, 
  categories = [] // 👈 מקבלים את הקטגוריות
}) {
  // --- State Definitions ---
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

  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchWrapperRef = useRef(null);

  // Auto-open logic
  const [autoOpenModel, setAutoOpenModel] = useState(false);
  const [autoOpenYear, setAutoOpenYear] = useState(false);
  const [autoOpenCategory, setAutoOpenCategory] = useState(false);

  const [yearRange, setYearRange] = useState([0, 0]);
  const [cursor, setCursor] = useState([0, 0]);

  const router = useRouter();
  const pathname = usePathname();

  // --- Helpers ---
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

  // --- Effects ---

  // 1. Fetch Facets
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/shopify/facets');
        const json = await res.json();
        setFacets(json || {});
      } catch (err) {
        console.error("Failed to fetch facets:", err);
      }
    })();
  }, []);

  // 2. Search Suggestions (Debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (filters.q && filters.q.length >= 1) { 
        setLoadingSuggestions(true);
        try {
          const res = await fetch(`/api/shopify/search-suggestions?q=${encodeURIComponent(filters.q)}`);
          const data = await res.json();
          setSuggestions(data.products || []);
          setShowDropdown(true);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.q]);

  // 3. Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Update Year Range when Model changes
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

  // --- Handlers ---

  const applyFilters = () => {
    const payload = { ...filters, yearFrom: String(cursor[0]), yearTo: String(cursor[1]) };
    onFilterChange(payload);

    const url = buildUrlFromFilters(payload, pathname, product);
    router.push(url, { scroll: false });
    setShowDropdown(false); 
  };

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

  // --- Render ---

  return (
    <aside dir="rtl" className="space-y-2 sticky top-20 p-4 bg-white text-red-600 border border-red-600 rounded-md">
      
      <h3 className="font-extrabold text-2xl border-b border-red-600 pb-2">סינון מוצרים</h3>

      {/* Whatsapp Link */}
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

      {/* Search Area */}
      <div className="space-y-1 relative" ref={searchWrapperRef}>
        <label className="text-lg font-bold">חיפוש לפי מק"ט/חופשי</label>
        <div className="relative">
            <input
              type="text"
              placeholder="לדוגמה: פילטר שמן או מק'ט"
              value={filters.q}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  q: e.target.value,
                  // Reset others
                  vendor: '', 
                  model: '',
                  yearFrom: '',
                  yearTo: '',
                  category: '',
                }))
              }
              onFocus={() => { if(suggestions.length > 0) setShowDropdown(true); }}
              className="w-full border border-red-600 bg-white text-gray-900 rounded-md p-2 pl-8 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            {loadingSuggestions && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                </div>
            )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-100">
                    {suggestions.map((item) => (
                        <li key={item.id}>
                            <Link 
                                href={`/shop/${item.handle}`}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 transition duration-150"
                                onClick={() => setShowDropdown(false)}
                            >
                                <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">אין</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-right">
                                    <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{item.type}</p>
                                </div>
                                <div className="text-sm font-bold text-red-600 whitespace-nowrap pl-1">
                                    ₪{parseInt(item.price)}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      {/* Vendor Filter */}
      <DropdownSimple
        id="filter-vendor"
        label="יצרן"
        value={filters.vendor}
        options={facets.vendors || []}
        onChange={handleVendorChange}
        forceOpen={false}
      />

      {/* Model Filter */}
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

      {/* Year Range Filter */}
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

      {/* Category Filter */}
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

      {/* Submit Button */}
      <button
        id="filter-submit-btn"
        onClick={applyFilters}
        className="w-full mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-md"
      >
        חפש
      </button>

      {/* 👇👇👇 התוספת: קטגוריות בתצוגת מחשב בלבד 👇👇👇 */}
      <div className="hidden md:block mt-8 pt-4 border-t border-gray-100">
         <MainCategoriesGrid categories={categories} isSidebar={true} />
      </div>

    </aside>
  );
}