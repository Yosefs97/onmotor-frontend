//components\MobileSocialMenu.jsx
'use client';
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import SocialIcons from './SocialIcons';

export default function MobileSocialMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div dir="rtl" className="text-center">
      {/* 🔘 כפתור פתיחה/סגירה */}
      <button
        onClick={() => setOpen(!open)}
        className="text-Xl bg-[#e60000] text-white px-3 py-2 rounded shadow hover:bg-gray-200 transition"
      >
        {open ? 'הסתר רשתות חברתיות' : 'הצג רשתות חברתיות'}{' '}
        {open ? <FaChevronUp className="inline" /> : <FaChevronDown className="inline" />}
      </button>

      {/* 🌐 אייקונים עם אנימציה */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
    open ? 'max-h-[400px] opacity-100 scale-100 mt-4' : 'max-h-0 opacity-0 scale-95'
  }`}
      >
        <div className="flex justify-center text-[8px] sm:text-[8px]">
          <SocialIcons className="text-[16px] sm:text-2xl" />
        </div>
      </div>
    </div>
  );
}
