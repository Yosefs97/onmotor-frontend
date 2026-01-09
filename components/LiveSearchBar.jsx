// /components/LiveSearchBar.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';

export default function LiveSearchBar({ onSelect }) {
  // --- אותם משתנים (State) כמו ב-ShopSidebar ---
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchWrapperRef = useRef(null);

  // --- 1. סגירה בלחיצה בחוץ (הועתק מ-ShopSidebar) ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 2. לוגיקת החיפוש (הועתקה מ-ShopSidebar) ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      // חיפוש החל מתו אחד, בדיוק כמו ב-Sidebar
      if (query && query.length >= 1) {
        setLoadingSuggestions(true);
        try {
          // שימוש באותו API בדיוק שעובד לך ב-Sidebar
          const res = await fetch(`/api/shopify/search-suggestions?q=${encodeURIComponent(query)}`);
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
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query) return;
    setShowDropdown(false);
    if (onSelect) onSelect();
  };

  return (
    <div ref={searchWrapperRef} className="relative w-full max-w-md mx-auto" dir="rtl">
      
      {/* שורת החיפוש עצמה */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש מוצר..."
          autoComplete="off" // חשוב: מונע מהדפדפן להסתיר את התוצאות
          onFocus={() => { if(query.length >= 1) setShowDropdown(true); }}
          className="
            w-full bg-white 
            border-2 border-red-600 
            text-gray-900 text-sm placeholder:text-sm placeholder:text-gray-500
            rounded-lg 
            focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none
            block py-1.5 pr-10 pl-2 shadow-sm h-[38px]
          "
        />
        
        {/* אייקון זכוכית מגדלת */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-600">
          <Search className="w-4 h-4" />
        </div>
        
        {/* כפתור ניקוי / טעינה */}
        {(query || loadingSuggestions) && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
             {loadingSuggestions ? (
               <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
             ) : (
               <button type="button" onClick={() => { setQuery(''); setSuggestions([]); setShowDropdown(false); }}>
                 <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
               </button>
             )}
          </div>
        )}
      </form>

      {/* --- 3. אזור התוצאות (הועתק מ-ShopSidebar והותאם למיקום) --- */}
      {/* הוספתי z-[9999] כדי להבטיח שזה צף מעל הכל */}
      {showDropdown && (suggestions.length > 0 || (!loadingSuggestions && query.length >= 1)) && (
        <div className="absolute top-full right-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-80 overflow-y-auto">
            
            {suggestions.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                    {suggestions.map((item) => (
                        <li key={item.id}>
                            <Link 
                                href={`/shop/${item.handle}`} 
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 transition duration-150" 
                                onClick={() => { setShowDropdown(false); if (onSelect) onSelect(); }}
                            >
                                {/* תמונה - בדיוק כמו ב-Sidebar */}
                                <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">אין</div>
                                    )}
                                </div>
                                
                                {/* טקסט - בדיוק כמו ב-Sidebar */}
                                <div className="flex-1 min-w-0 text-right">
                                    <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{item.type}</p>
                                </div>
                                
                                {/* מחיר - בדיוק כמו ב-Sidebar */}
                                <div className="text-sm font-bold text-red-600 whitespace-nowrap pl-1">
                                    ₪{parseInt(item.price || 0)}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                // הודעה כשאין תוצאות
                !loadingSuggestions && (
                    <div className="p-4 text-center text-sm text-gray-500 font-medium">
                        לא נמצאו מוצרים תואמים.
                    </div>
                )
            )}
        </div>
      )}
    </div>
  );
}