// components/LegalLinks.jsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function LegalLinks({ layout = 'horizontal', isMobile = false, onLinkClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/about', label: 'אודות' }, // ✅ הוספתי את דף האודות כאן
    { href: '/PrivacyPolicy', label: 'מדיניות פרטיות' },
    { href: '/TermsOfService', label: 'תנאי שימוש' },
    { href: '/accessibility', label: 'הצהרת נגישות' },
    { href: '/data-deletion-instructions', label: 'מחיקת נתונים' },
  ];

  // ✅ תצוגת מחשב (אופקית)
  if (!isMobile || layout === 'horizontal') {
    return (
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={false}
            onClick={onLinkClick}
            className="px-4 py-1.5 border-2 border-[#e60000] text-[#e60000] font-bold rounded-md hover:bg-[#e60000] hover:text-white transition text-sm shadow-sm"
          >
            {link.label}
          </Link>
        ))}
      </div>
    );
  }

  // ✅ תצוגת מובייל (נפתח מתחת להרשמה)
  return (
    <div className="w-full mt-4 text-right">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-bold bg-white border border-gray-300 px-3 py-2.5 rounded-md shadow-sm hover:bg-gray-50 text-gray-800"
      >
        אודות ומדיניות
        {isOpen ? <FaChevronUp className="text-[#e60000]" /> : <FaChevronDown />}
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-80 mt-2 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={false}
            onClick={() => {
              setIsOpen(false);
              if (onLinkClick) onLinkClick();
            }}
            className="block text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 my-1 hover:bg-[#e60000] hover:text-white hover:border-[#e60000] transition"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}