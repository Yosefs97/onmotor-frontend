// components/LegalLinks.jsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function LegalLinks({ layout = 'horizontal', isMobile = false, onLinkClick, isShop = false }) {
  const [isOpen, setIsOpen] = useState(false);

  // הפרדה בין קישורי המגזין לקישורי החנות
  const magazineLinks = [
    { href: '/about', label: 'אודות המדיה' },
    { href: '/PrivacyPolicy', label: 'מדיניות פרטיות' },
    { href: '/TermsOfService', label: 'תנאי שימוש' },
    { href: '/accessibility', label: 'הצהרת נגישות' },
    { href: '/data-deletion-instructions', label: 'מחיקת נתונים' },
  ];

  const shopLinks = [
    { href: '/shop/shipping', label: 'מדיניות משלוחים' },
    { href: '/shop/returns', label: 'החזרות והחלפות' },
    { href: '/shop/terms', label: 'תקנון החנות' },
    { href: '/shop/privacy', label: 'מדיניות פרטיות חנות' },
    { href: '/shop/accessibility', label: 'הצהרת נגישות' },
  ];

  const links = isShop ? shopLinks : magazineLinks;

  // ✅ תצוגת חנות (עיצוב רשימה אנכית מקובל לחנויות) או תצוגת מחשב אופקית למגזין
  if (!isMobile || layout === 'horizontal') {
    if (isShop) {
      // בחנות נרצה להציג את זה כרשימה נקייה ואינטואיטיבית ולא כ"כפתורים" בולטים מדי
      return (
        <ul className="space-y-2.5 text-right">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                prefetch={false}
                onClick={onLinkClick}
                className="text-sm text-gray-400 hover:text-[#e60000] transition duration-200"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      );
    }

    // תצוגת כפתורי המגזין המקוריים שלך
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

  // ✅ תצוגת מובייל (תפריט נפתח קורדון)
  return (
    <div className="w-full mt-4 text-right">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-bold bg-white border border-gray-300 px-3 py-2.5 rounded-md shadow-sm hover:bg-gray-50 text-gray-800"
      >
        {isShop ? 'מידע משפטי ושירות לקוחות' : 'אודות ומדיניות'}
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