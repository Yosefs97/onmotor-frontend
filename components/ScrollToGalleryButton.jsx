// components/ScrollToGalleryButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaImages } from 'react-icons/fa';

export default function ScrollToGalleryButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const table = document.querySelector('.article-table-section');
      if (!table) return;

      const rect = table.getBoundingClientRect();
      const show = rect.top < window.innerHeight && rect.bottom > 0;
      setIsVisible(show);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToGallery = () => {
    const gallery = document.querySelector('.article-gallery-section');
    if (gallery) {
      gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToGallery}
      className="fixed bottom-36 right-1 z-[9999] bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
    >
      <FaImages className="text-lg" />
      <span className="text-sm font-semibold">לגלריה</span>
    </button>
  );
}
