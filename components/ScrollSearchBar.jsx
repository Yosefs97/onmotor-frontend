// /components/ScrollSearchBar.jsx
'use client';

import { useState, useEffect, useRef } from 'react';

export default function ScrollSearchBar({ placeholder, containerRef, manufacturers = [] }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const highlightClasses = [
    'ring-2',
    'ring-red-400',
    'bg-red-100',
    'transition',
    'duration-300'
  ];

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
      // 👇 שינוי 1: שימוש ב-includes במקום startsWith בסימון קופסאות
      if (name.includes(lowerQ)) {
        el.classList.add(...highlightClasses);
        if (!firstMatch) firstMatch = el;
      }
    });

    // Scroll לראשון
    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 👇 שינוי 2: שימוש ב-includes במקום startsWith בתפריט הנפתח
  const filteredOptions = manufacturers.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative flex flex-col justify-center mb-4 w-54" ref={wrapperRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onClick={() => setIsOpen(true)}
        className="border-2 border-[#e60000] rounded px-3 py-1 text-sm w-full text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e60000]"
      />

      {isOpen && query && filteredOptions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50">
          {filteredOptions.map((m) => (
            <li
              key={m.id}
              onClick={() => {
                setQuery(m.title);
                setIsOpen(false);
              }}
              className="px-3 py-2 text-sm text-gray-800 cursor-pointer hover:bg-red-50 hover:text-[#e60000] transition-colors"
            >
              {m.title}
            </li>
          ))}
        </ul>
      )}

      {/* 👇 שינוי 3: טקסט כללי ודינמי יותר כשאין תוצאות */}
      {isOpen && query && filteredOptions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border border-gray-200 rounded shadow-lg z-50 text-sm text-gray-500 text-center">
          לא נמצאו תוצאות
        </div>
      )}
    </div>
  );
}