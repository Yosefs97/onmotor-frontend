// components/ScrollToTableButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaTable } from 'react-icons/fa';

export default function ScrollToTableButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const articleContent = document.querySelector('.article-content'); // גוף הכתבה
      const table = document.querySelector('.article-table-section');
      const gallery = document.querySelector('.article-gallery-section');
      if (!articleContent) return;

      const rect = articleContent.getBoundingClientRect();
      const tableRect = table?.getBoundingClientRect();
      const galleryRect = gallery?.getBoundingClientRect();

      const startOffset = window.innerHeight * 0.25; // בערך אחרי כמה שורות
      const endOffset = window.innerHeight * 0.15;

      const afterStart = rect.top < -startOffset; // עברו את תחילת הכתבה
      const beforeTable = tableRect ? tableRect.top > endOffset : true;
      const afterGallery = galleryRect ? galleryRect.bottom < window.innerHeight : false;

      // ✅ מוצג אם עברו את ההתחלה ועדיין לא בטבלה
      // או אם נמצאים אחרי הגלריה (כלומר בסוף הכתבה)
      setIsVisible((afterStart && beforeTable) || afterGallery);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTable = () => {
    const table = document.querySelector('.article-table-section');
    if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button
      onClick={scrollToTable}
      className={`fixed bottom-20 right-1 z-[5000] bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-500 ease-in-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <FaTable className="text-lg" />
      <span className="text-sm font-semibold">למפרט</span>
    </button>
  );
}
