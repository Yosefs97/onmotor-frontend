// components/ScrollToTableButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaTable } from 'react-icons/fa';

export default function ScrollToTableButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const secondDesc = document.querySelector('.second-description');
      if (!secondDesc) return;

      const rect = secondDesc.getBoundingClientRect();
      const show = rect.top < window.innerHeight * 0.3;
      setIsVisible(show);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTable = () => {
    const table = document.querySelector('.article-table-section');
    if (table) {
      table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTable}
      className="fixed bottom-20 right-1 z-[9999] bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
    >
      <FaTable className="text-lg" />
      <span className="text-sm font-semibold">למפרט</span>
    </button>
  );
}
