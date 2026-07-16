// /components/ScrollSearchBar.jsx
'use client';

import { useState, useEffect, useRef } from 'react';

// 👇 הוספנו את 'manufacturers' בתור prop כדי שנוכל להציג אותם בתפריט
export default function ScrollSearchBar({ placeholder, containerRef, manufacturers = [] }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false); // סטייט חדש לניהול פתיחת/סגירת התפריט
  const wrapperRef = useRef(null); // רפרנס לעיטוף כדי שנוכל לסגור בלחיצה בחוץ

  const highlightClasses = [
    'ring-2',
    'ring-red-400',
    'bg-red-100',
    'transition',
    'duration-300'
  ];

  // לוגיקת החיפוש, הגלילה והסימון המקורית שלך
  useEffect(() => {
    if (!containerRef?.current) return;

    const items = Array.from(containerRef.current.querySelectorAll('[data-name]'));

    // מנקים קודם
    items.forEach((el) => el.classList.remove(...highlightClasses));

    if (!query) return;

    const lowerQ = query.toLowerCase();
    let firstMatch = null;

    items.forEach((el) => {
      const name = el.dataset.name.toLowerCase();
      if (name.startsWith(lowerQ)) {
        el.classList.add(...highlightClasses);
        if (!firstMatch) firstMatch = el;
      }
    });

    // Scroll לראשון
    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [query]);

  // סגירת התפריט בעת קליק מחוץ לאזור החיפוש
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // סינון היצרנים שיוצגו בתפריט הנפתח לפי מה שהוקלד
  const filteredOptions = manufacturers.filter((m) =>
    m.title.toLowerCase().startsWith(query.toLowerCase())
  );

  return (
    // 👇 הוספנו relative כדי שהתפריט הנפתח (absolute) ימוקם ביחס אליו
    <div className="relative flex flex-col justify-center mb-4 w-54" ref={wrapperRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true); // פותח את התפריט בעת הקלדה
        }}
        onClick={() => setIsOpen(true)} // פותח את התפריט גם בעת לחיצה על השדה
        className="border-2 border-[#e60000] rounded px-3 py-1 text-sm w-full text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e60000]"
      />

      {/* 👇 התפריט הנפתח */}
      {isOpen && query && filteredOptions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50">
          {filteredOptions.map((m) => (
            <li
              key={m.id}
              onClick={() => {
                setQuery(m.title); // מעדכן את שדה החיפוש עם השם שנבחר (וזה יפעיל את הגלילה!)
                setIsOpen(false); // סוגר את התפריט
              }}
              className="px-3 py-2 text-sm text-gray-800 cursor-pointer hover:bg-red-50 hover:text-[#e60000] transition-colors"
            >
              {m.title}
            </li>
          ))}
        </ul>
      )}

      {/* הודעה כשאין תוצאות (אופציונלי) */}
      {isOpen && query && filteredOptions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border border-gray-200 rounded shadow-lg z-50 text-sm text-gray-500 text-center">
          לא נמצאו יצרנים
        </div>
      )}
    </div>
  );
}