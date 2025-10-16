'use client';
import React, { useEffect, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      setIsVisible(scrollTop > 100); // מופיע לאחר גלילה של 100 פיקסלים
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-1 z-[9999] bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
        aria-label="חזור לראש העמוד"
      >
        <FaArrowUp className="text-xl" />
      </button>
    )
  );
}
