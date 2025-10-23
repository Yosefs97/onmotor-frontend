// components/LegalLinks.jsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function LegalLinks({ layout = 'horizontal', isMobile = false, onLinkClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/PrivacyPolicy', label: 'מדיניות פרטיות' },
    { href: '/TermsOfService', label: 'תנאי שימוש' },
    { href: '/data-deletion-instructions', label: 'מחיקת נתונים' },
  ];

  // ✅ תצוגת מחשב (אופקית)
  if (!isMobile || layout === 'horizontal') {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className="px-4 py-1 border border-[#e60000] text-[#e60000] rounded-md hover:bg-[#e60000] hover:text-white transition text-sm"
          >
            {link.label}
          </Link>
        ))}
      </div>
    );
  }

  // ✅ תצוגת מובייל (נפתח מתחת להרשמה)
  return (
    <div className="w-full mt-2 text-right">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-semibold bg-white border border-gray-300 px-3 py-2 rounded-md shadow hover:bg-gray-100"
      >
        מדיניות האתר
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-40 mt-2' : 'max-h-0'
        }`}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => {
              setIsOpen(false);
              if (onLinkClick) onLinkClick();
            }}
            className="block text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 my-1 hover:bg-[#e60000] hover:text-white transition"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
