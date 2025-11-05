// components/ScrollToTableButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaTable } from 'react-icons/fa';

export default function ScrollToTableButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const desc = document.querySelector('.second-description');
      const table = document.querySelector('.article-table-section');
      if (!desc || !table) return;

      const descRect = desc.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      const beforeTable = descRect.top < window.innerHeight * 0.3 && tableRect.top > window.innerHeight * 0.3;
      setIsVisible(beforeTable);
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
      className={`fixed bottom-20 right-1 z-[5000] bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2
      transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <FaTable className="text-lg" />
      <span className="text-sm font-semibold">למפרט</span>
    </button>
  );
}
