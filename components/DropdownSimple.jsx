// /components/DropdownSimple.jsx
"use client";
import { useState, useRef, useEffect } from "react";

export default function DropdownSimple({ label, value, onChange, options = [], disabled = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(""); // טקסט שמוקלד
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLabel = (opt) => (typeof opt === "string" ? opt : opt.label);
  const getValue = (opt) => (typeof opt === "string" ? opt : opt.value);

  // סינון אופציות לפי מה שהמשתמש הקליד
  const filteredOptions = options.filter((opt) =>
    getLabel(opt).toLowerCase().includes(search.toLowerCase())
  );

  // בחירה + הפעלת applyFilters דרך CustomEvent
  const handleSelect = (val) => {
    onChange(val);
    setSearch("");
    setOpen(false);
    // שליחת אירוע גלובלי להפעלת applyFilters
    document.dispatchEvent(new Event("dropdownFilterApplied"));
  };

  // לחיצה על Enter בתוך ה־input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (search.trim() !== "") {
        const match = options.find(
          (opt) => getLabel(opt).toLowerCase() === search.toLowerCase()
        );
        if (match) {
          handleSelect(getValue(match));
        } else {
          handleSelect(search.trim());
        }
      }
    }
  };

  return (
    <div className="w-full relative mb-3" ref={dropdownRef}>
      <label className="block text-sm mb-1">{label}</label>

      {/* כפתור לפתיחה */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full border px-2 py-1 rounded flex justify-between items-center ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        }`}
      >
        <span>
          {(() => {
            const selected = options.find((opt) => getValue(opt) === value);
            return selected ? getLabel(selected) : "בחר";
          })()}
        </span>
        <span className="text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {/* הרשימה עם שדה חיפוש */}
      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow 
                        max-h-40 overflow-y-auto overscroll-contain left-0 right-0 p-2 space-y-1">
          {/* שדה הקלדה */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="הקלד לחיפוש..."
            className="w-full border rounded px-2 py-1 mb-2 text-sm"
            autoFocus
          />

          {/* תוצאות */}
          {filteredOptions.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">אין אפשרויות</div>
          )}
          {filteredOptions.map((opt, idx) => {
            const optLabel = getLabel(opt);
            const optValue = getValue(opt);
            return (
              <div
                key={idx}
                className={`px-3 py-2 cursor-pointer hover:bg-red-100 ${
                  value === optValue ? "bg-red-200 font-bold" : ""
                }`}
                onClick={() => handleSelect(optValue)}
              >
                {optLabel}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
