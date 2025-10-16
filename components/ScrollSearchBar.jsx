// /components/ScrollSearchBar.jsx
'use client';

import { useState, useEffect } from 'react';

export default function ScrollSearchBar({ placeholder, containerRef }) {
  const [query, setQuery] = useState('');
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

  return (
    <div className="flex justify-between items-center mb-4">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded px-3 py-1 text-sm w-48"
      />
    </div>
  );
}
