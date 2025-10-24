'use client';
import React, { useState, useEffect, useId } from "react";
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import Image from 'next/image';
import { IoClose } from "react-icons/io5";
import generateSearchSuggestions from "@/lib/generateSearchSuggestions";

export default function SearchBar({ onSelect = () => {} }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);

  // 🆔 useId מבטיח מזהה ייחודי לכל מופע רכיב
  const inputId = useId();

  useEffect(() => {
    async function fetchSuggestions() {
      const data = await generateSearchSuggestions();
      setSuggestions(data);
    }
    fetchSuggestions();
  }, []);

  const fuse = new Fuse(suggestions, {
    keys: ['title'],
    threshold: 0.3,
    includeMatches: true,
    minMatchCharLength: 1,
    ignoreLocation: true,
    useExtendedSearch: true,
  });

  const isPopular = !query.trim();
  
  // --- ⭐️ כאן התיקון ⭐️ ---
  // החלפנו את 'popularSuggestions' (שלא מוגדר) ב-'suggestions' (שמכיל את הנתונים)
  const showResults = (isFocused || isHovered) && (isPopular ? suggestions : filtered);
  // --- ⭐️ סוף התיקון ⭐️ ---

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);

    if (!value.trim()) {
      setFiltered([]);
      return;
    }

    const results = fuse.search(value.trim());
    setFiltered(results.map(result => ({
      ...result.item,
      matches: result.matches
    })));
  };

  const handleSelect = (path) => {
    router.push(path);
    onSelect();
    closeSearch();
  };

  const closeSearch = () => {
    setQuery('');
    setFiltered([]);
    setIsFocused(false);
    setIsHovered(false);
    setActiveIndex(-1);
  };

  const highlightMatch = (text, matches) => {
    const match = matches?.find(m => m.key === 'title');
    if (!match || !match.indices.length) return text;

    const parts = [];
    let lastIndex = 0;
    match.indices.forEach(([start, end], i) => {
      parts.push(text.slice(lastIndex, start));
      parts.push(<mark key={i} className="bg-yellow-300 px-0.5">{text.slice(start, end + 1)}</mark>);
      lastIndex = end + 1;
    });
    parts.push(text.slice(lastIndex));
    return parts;
  };

  return (
    <div
      className="relative lg:w-72 text-right"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setTimeout(() => setIsHovered(false), 150)}
    >
      <form
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
        className="relative w-full"
      >
        {/* ✅ label משויך לשדה לפי id ייחודי */}
        <label htmlFor={inputId} className="sr-only">
          חיפוש באתר OnMotor Media
        </label>

        <input
          dir="rtl"
          id={inputId}
          name={`search-input-${inputId}`}
          type="text"
          autoComplete="new-password"
          autoCorrect="off"
          spellCheck="false"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (!showResults.length) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveIndex((prev) => (prev + 1) % showResults.length);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIndex((prev) => (prev - 1 + showResults.length) % showResults.length);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const selected = showResults[activeIndex];
              if (selected) handleSelect(selected.path);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              closeSearch();
            }
          }}
          placeholder="חפש באתר..."
          className="text-right text-white placeholder-white p-1 pr-1 rounded border border-red-600 w-full transition-all duration-300"
        />

        {(query.trim() || showResults.length > 0) && (
          <button
            type="button"
            onClick={closeSearch}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:text-red-600 text-xl"
            aria-label="נקה וסגור חיפוש"
          >
            <IoClose />
          </button>
        )}
      </form>

      {showResults.length > 0 && (
        <ul
          dir="rtl"
          className="absolute top-full mt-0 right-0 bg-white border border-gray-300 rounded shadow-lg z-50 w-full text-sm text-black max-h-60 overflow-y-auto"
        >
          {isPopular && (
            <div className="flex justify-end p-2 border-b border-gray-200">
              <button
                type="button"
                onClick={closeSearch}
                className="text-white hover:text-red-600 transition text-xl"
                aria-label="סגור הצעות פופולריות"
              >
                <IoClose />
              </button>
            </div>
          )}

          {showResults.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item.path)}
              className={`flex items-center gap-2 cursor-pointer px-3 py-2
                ${idx === activeIndex ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
            >
              {item.image && (
                <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
              )}
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {highlightMatch(item.title, item.matches || [])}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}