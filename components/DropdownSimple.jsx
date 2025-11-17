// /components/DropdownSimple.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DropdownSimple({
  id,
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  forceOpen = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // סגירה בלחיצה בחוץ
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // פתיחה אוטומטית לפי forceOpen (משמש לפתיחה של השורה הבאה)
  useEffect(() => {
    if (forceOpen && !disabled) {
      setOpen(true);
    }
  }, [forceOpen, disabled]);

  // נעילת גלילה + גלילה למרכז כשה־dropdown פתוח
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (open) {
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        dropdownRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 80);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const getLabel = (opt) => (typeof opt === "string" ? opt : opt.label);
  const getValue = (opt) => (typeof opt === "string" ? opt : opt.value);

  const filteredOptions = options.filter((opt) =>
    getLabel(opt).toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val) => {
    onChange(val);
    setSearch("");
    setOpen(false);
    document.dispatchEvent(new Event("dropdownFilterApplied"));
  };

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
    <div id={id} className="w-full relative mb-3" ref={dropdownRef}>
      <label className="block text-sm mb-1">{label}</label>

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

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            key="dropdown-panel"
            initial={{
              opacity: 0,
              y: -10,
              x: isMobile ? 0 : 15,
              scale: isMobile ? 1 : 0.98,
            }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: -10,
              x: isMobile ? 0 : -10,
              scale: isMobile ? 1 : 0.98,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className={`${
              isMobile
                ? "fixed left-1/2 -translate-x-1/2 top-28 w-[90vw] max-h-[50vh]"
                : "absolute left-0 right-0 mt-1 w-full max-h-40"
            } z-20 bg-white border rounded shadow overflow-y-auto overscroll-contain p-2 space-y-1`}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="הקלד לחיפוש..."
              className="w-full border rounded px-2 py-1 mb-2 text-sm"
              autoFocus
            />

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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
