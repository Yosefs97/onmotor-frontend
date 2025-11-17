// components/ScrollToTableButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaTable } from 'react-icons/fa';

export default function ScrollToTableButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [desktopRight, setDesktopRight] = useState(20);

  // ✔ זיהוי מובייל/מחשב
  useEffect(() => {
    const checkDevice = () => setIsDesktop(window.innerWidth > 1024);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // ✔ חישוב מיקום יחסית לעמוד הכתבה
  useEffect(() => {
    if (!isDesktop) return;

    const calcPosition = () => {
      const article = document.querySelector('.article-content-wrapper');
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const fromRight = window.innerWidth - rect.right;

      setDesktopRight(fromRight + 20);
    };

    calcPosition();
    window.addEventListener('resize', calcPosition);
    return () => window.removeEventListener('resize', calcPosition);
  }, [isDesktop]);

  // ✔ הופעה/היעלמות – כולל SimilarArticles
  useEffect(() => {
    const handleScroll = () => {
      const content = document.querySelector('.article-content');
      const table = document.querySelector('.article-table-section');
      const similar = document.querySelector('.similar-articles-section');

      if (!content || !table) return;

      const contentRect = content.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      const similarRect = similar ? similar.getBoundingClientRect() : null;

      const startVisible = contentRect.top < window.innerHeight * 0.6;

      const inTable =
        tableRect.top < window.innerHeight * 0.8 &&
        tableRect.bottom > window.innerHeight * 0.2;

      const passedSimilar =
        similarRect && similarRect.bottom < 0.8;
      setIsVisible(startVisible && !inTable && !passedSimilar);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTable = () => {
    const table = document.querySelector('.article-table-section');
    if (table)
      table.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button
      onClick={scrollToTable}
      className={`fixed z-[5000] bg-blue-600 right-1 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-500 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      style={{
        bottom: isDesktop ? '210px' : '130px',
        right: isDesktop ? `${desktopRight}px` : '8px',
      }}
    >
      <FaTable className="text-lg" />
      <span className="text-sm font-semibold">למפרט</span>
    </button>
  );
}
