// components/LegalLinks.jsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ShopPolicyModals from '@/components/ShopPolicyModals'; // ייבוא המודלים שבנינו

export default function LegalLinks({ layout = 'horizontal', isMobile = false, onLinkClick, isShop = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'shipping' | 'returns' | 'warranty' | 'security'

  const magazineLinks = [
    { href: '/about', label: 'אודות', isModal: false },
    { href: '/PrivacyPolicy', label: 'מדיניות פרטיות', isModal: false },
    { href: '/TermsOfService', label: 'תנאי שימוש', isModal: false },
    { href: '/accessibility', label: 'הצהרת נגישות', isModal: false },
    { href: '/data-deletion-instructions', label: 'מחיקת נתונים', isModal: false },
  ];

  // רשימת החנות המשולבת (חלק מודלים, חלק עמודים רשמיים)
  const shopLinks = [
    { id: 'shipping', label: 'מדיניות משלוחים', isModal: true },
    { id: 'returns', label: 'החזרות והחלפות', isModal: true },
    { id: 'warranty', label: 'אחריות על חלפים', isModal: true },
    { id: 'security', label: 'אבטחת תשלומים', isModal: true },
    { href: '/shop/terms', label: 'תקנון החנות', isModal: false },
    { href: '/shop/privacy', label: 'מדיניות פרטיות', isModal: false },
    { href: '/shop/accessibility', label: 'הצהרת נגישות', isModal: false },
  ];

  const links = isShop ? shopLinks : magazineLinks;

  const handleModalOpen = (id) => {
    setActiveModal(id);
    setIsOpen(false); // סוגר את האקורדיון במובייל אם היה פתוח
    if (onLinkClick) onLinkClick();
  };

  return (
    <>
      {/* רינדור המודלים ברקע - יקפצו רק כש-activeModal מקבל ערך */}
      <ShopPolicyModals activeModal={activeModal} onClose={() => setActiveModal(null)} />

      {/* תצוגת מחשב / רשימה אנכית לחנות */}
      {(!isMobile || layout === 'horizontal') ? (
        isShop ? (
          <ul className="space-y-2.5 text-right">
            {links.map((item) => (
              <li key={item.id || item.href}>
                {item.isModal ? (
                  <button
                    onClick={() => handleModalOpen(item.id)}
                    className="text-sm text-gray-400 hover:text-[#e60000] transition duration-200 bg-transparent border-none p-0 cursor-pointer font-normal"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-[#e60000] transition duration-200 block">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="px-4 py-1.5 border-2 border-[#e60000] text-[#e60000] font-bold rounded-md hover:bg-[#e60000] hover:text-white transition text-sm shadow-sm">
                {link.label}
              </Link>
            ))}
          </div>
        )
      ) : (
        /* תצוגת מובייל נפתחת */
        <div className="w-full mt-4 text-right">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-sm font-bold bg-white border border-gray-300 px-3 py-2.5 rounded-md shadow-sm text-gray-800"
          >
            {isShop ? 'מידע משפטי ושירות לקוחות' : 'אודות ומדיניות'}
            {isOpen ? <FaChevronUp className="text-[#e60000]" /> : <FaChevronDown />}
          </button>

          <div className={`transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-96 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
            {links.map((item) => (
              item.isModal ? (
                <button
                  key={item.id}
                  onClick={() => handleModalOpen(item.id)}
                  className="block w-full text-right text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 my-1 hover:bg-[#e60000] hover:text-white transition"
                >
                  {item.label}
                </button>
              ) : (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="block text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 my-1 hover:bg-[#e60000] hover:text-white transition">
                  {item.label}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </>
  );
}