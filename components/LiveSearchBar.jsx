// /components/LiveSearchBar.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';

export default function LiveSearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 1) {
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
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query) return;
    setIsOpen(false);
    if (onSelect) onSelect();
    console.log("Searching for:", query);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto" dir="rtl">
      
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש מוצר..."
          className="
            w-full bg-white 
            border-2 border-red-600 
            text-gray-900 text-lg placeholder:text-lg placeholder:text-gray-500
            rounded-lg 
            focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none
            block p-2.5 pr-10 shadow-sm
          "
          onFocus={() => { if(results.length > 0) setIsOpen(true); }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-600">
          <Search className="w-5 h-5" />
        </div>
        
        {(query || loading) && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
             {loading ? (
               <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
             ) : (
               <button type="button" onClick={() => { setQuery(''); setResults([]); }}>
                 <X className="w-5 h-5 text-gray-400 hover:text-red-600" />
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
                {/* 👇 התיקון כאן: הוסר /product מהנתיב */}
                <Link 
                  href={`/shop/${product.handle}`}
                  onClick={() => { setIsOpen(false); if (onSelect) onSelect(); }}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 transition duration-150"
                >
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                    {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">אין</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {product.type}
                    </p>
                  </div>

                  <div className="text-sm font-bold text-red-600 whitespace-nowrap px-2">
                    ₪{parseInt(product.price)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isOpen && query.length >= 1 && !loading && results.length === 0 && (
         <div className="absolute top-full right-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] p-4 text-center text-sm text-gray-500 font-medium">
            לא נמצאו מוצרים תואמים.
         </div>
      )}
    </div>
  );
}