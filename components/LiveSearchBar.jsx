// /components/LiveSearchBar.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';

export default function LiveSearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef(null);

  // סגירת התפריט בלחיצה מחוץ לרכיב
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // מנגנון חיפוש עם השהייה (Debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await fetch(`/api/shopify/search-suggestions?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data.products || []);
          setIsOpen(true);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300); // מחכה 300ms אחרי סיום ההקלדה

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query) return;
    setIsOpen(false);
    if (onSelect) onSelect();
    // הפניה לדף תוצאות חיפוש מלא (נניח שיש לך כזה)
    // router.push(`/shop/search?q=${encodeURIComponent(query)}`); 
    // כרגע נשתמש בדוגמה פשוטה של מעבר למוצר הראשון או לוגיקה אחרת שתרצה
    console.log("Full search submitted for:", query);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto" dir="rtl">
      
      {/* שדה החיפוש */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש מוצר..." // כדאי להחליף ב"חפש מעיל, קסדה..."
          className="w-full bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 pr-10"
          onFocus={() => { if(results.length > 0) setIsOpen(true); }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
          <Search className="w-4 h-4" />
        </div>
        
        {/* כפתור ניקוי / טעינה */}
        {(query || loading) && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
             {loading ? (
               <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
             ) : (
               <button type="button" onClick={() => { setQuery(''); setResults([]); }}>
                 <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
               </button>
             )}
          </div>
        )}
      </form>

      {/* רשימת ההצעות */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full right-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {results.map((product) => (
              <li key={product.id}>
                <Link 
                  href={`/shop/product/${product.handle}`}
                  onClick={() => { setIsOpen(false); if (onSelect) onSelect(); }}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 transition duration-150"
                >
                  {/* תמונה מוקטנת */}
                  <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">אין</div>
                    )}
                  </div>
                  
                  {/* טקסט */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.type}
                    </p>
                  </div>

                  {/* מחיר */}
                  <div className="text-sm font-bold text-red-600 whitespace-nowrap">
                    ₪{parseInt(product.price)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          {/* לינק לכל התוצאות */}
          <div className="bg-gray-50 p-2 text-center border-t">
              <button 
                onClick={handleSearchSubmit}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                  צפה בכל התוצאות עבור "{query}"
              </button>
          </div>
        </div>
      )}
      
      {/* מצב שאין תוצאות */}
      {isOpen && query.length >= 2 && !loading && results.length === 0 && (
         <div className="absolute top-full right-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] p-4 text-center text-sm text-gray-500">
            לא נמצאו מוצרים תואמים.
         </div>
      )}
    </div>
  );
}