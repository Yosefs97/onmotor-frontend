'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';

export default function LiveSearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // משתנה למיקום התפריט
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // פונקציה לעדכון מיקום התפריט שיידבק לשורת החיפוש
  const updatePosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 5, // 5 פיקסלים רווח מלמטה
        left: rect.left,
        width: rect.width
      });
    }
  };

  // האזנה לשינויי גודל מסך או גלילה כדי שהתפריט יישאר דבוק
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // סגירה בלחיצה בחוץ
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // מנגנון חיפוש מול ה-API (header-search)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 1) { // חיפוש החל מהאות הראשונה
        setLoading(true);
        // עדכון מיקום לפני פתיחה
        updatePosition();
        try {
          const res = await fetch(`/api/shopify/header-search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.products || []);
            setIsOpen(true);
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error(error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query) return;
    setIsOpen(false);
    if (onSelect) onSelect();
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto" dir="rtl">
      
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          ref={inputRef} // הוספנו Ref כדי לעקוב אחרי המיקום
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש מוצר..."
          autoComplete="off"
          onFocus={() => { if(query.length >= 1) { updatePosition(); setIsOpen(true); } }}
          className="
            w-full bg-white 
            border-2 border-red-600 
            text-gray-900 text-sm placeholder:text-sm placeholder:text-gray-500
            rounded-lg 
            focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none
            block py-1.5 pr-10 pl-2 shadow-sm h-[38px]
          "
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-600">
          <Search className="w-4 h-4" />
        </div>
        
        {(query || loading) && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
             {loading ? (
               <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
             ) : (
               <button type="button" onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}>
                 <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
               </button>
             )}
          </div>
        )}
      </form>

      {/* תפריט התוצאות - Fixed עם מיקום מחושב דינמית */}
      {isOpen && (results.length > 0 || (!loading && query.length >= 1)) && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl z-[99999] overflow-hidden max-h-80 overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {results.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {results.map((product) => (
                <li key={product.id}>
                  <Link 
                    href={`/shop/${product.handle}`}
                    onClick={() => { setIsOpen(false); if (onSelect) onSelect(); }}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 transition duration-150"
                  >
                    <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">אין</div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-sm font-bold text-gray-900 truncate">{product.title}</p>
                      <p className="text-xs text-gray-500 truncate">{product.type}</p>
                    </div>

                    <div className="text-sm font-bold text-red-600 whitespace-nowrap px-2">
                      ₪{parseInt(product.price || 0)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            !loading && (
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