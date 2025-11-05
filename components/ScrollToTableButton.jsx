// components/ScrollToTableButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaTable } from 'react-icons/fa';

export default function ScrollToTableButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const content = document.querySelector('.article-content');
      const table = document.querySelector('.article-table-section');
      const gallery = document.querySelector('.article-gallery-section');
      const comments = document.querySelector('.comments-section');
      if (!content) return;

      const contentRect = content.getBoundingClientRect();
      const tableRect = table?.getBoundingClientRect();
      const galleryRect = gallery?.getBoundingClientRect();
      const commentsRect = comments?.getBoundingClientRect();

      const startVisible = contentRect.top < window.innerHeight * 0.6;
      const inTable =
        tableRect &&
        tableRect.top < window.innerHeight * 0.8 &&
        tableRect.bottom > window.innerHeight * 0.2;
      const afterGallery =
        galleryRect && galleryRect.bottom < window.innerHeight * 0.8;
      const inComments =
        commentsRect &&
        commentsRect.top < window.innerHeight &&
        commentsRect.bottom > 0;

      const isMobile = window.innerWidth <= 1024;

      // ✅ מופיע אחרי תחילת הכתבה, נעלם בטבלה,
      // מופיע שוב אחרי הגלריה, נעלם בסוף (תגובות)
      const show = (startVisible && !inTable) || afterGallery;
      const hideAtComments = isMobile && inComments;

      setIsVisible(show && !hideAtComments);
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
      className={`fixed bottom-15 right-1 z-[5000] bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-500 ease-in-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <FaTable className="text-lg" />
      <span className="text-sm font-semibold">למפרט</span>
    </button>
  );
}
