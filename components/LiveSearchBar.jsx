'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';

export default function LiveSearchBar({ onSelect }) {
  // משתמשים באותם שמות משתנים כמו ב-ShopSidebar לצורך עקביות (למעט filters שהפך ל-query פשוט)
  const [query, setQuery] = useState(''); 
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchWrapperRef = useRef(null);

  // סגירה בלחיצה בחוץ (בדיוק כמו ב-ShopSidebar)
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // הלוגיקה של ה-Fetch (מועתקת אחד לאחד מהקובץ שעובד)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query && query.length >= 1) { 
        setLoadingSuggestions(true);
        try {
          // שימוש באותו Endpoint בדיוק
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
      
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש מוצר..."
          autoComplete="off" // מונע השלמה אוטומטית שמסתירה את התוצאות
          onFocus={() => { if(suggestions.length > 0 || query.length > 0) setShowDropdown(true); }}
          className="
            w-full bg-white 
            border-2 border-red-600 
            text-gray-900 text-sm placeholder:text-sm placeholder:text-gray-500
            rounded-lg 
            focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none
            block py-1.5 pr-10 pl-2 shadow-sm h-[38px]
          "
        />
        
        {/* אייקון חיפוש בצד ימין */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-600">
          <Search className="w-4 h-4" />
        </div>
        
        {/* כפתור איפוס או טעינה בצד שמאל */}
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

      {/* --- אזור התוצאות (מועתק מ-ShopSidebar) --- */}
      {/* הוספתי z-[9999] כדי לוודא שזה עולה על הכל */}
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