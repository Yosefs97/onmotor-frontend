// components/ScrollToGalleryButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaImages } from 'react-icons/fa';

export default function ScrollToGalleryButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const articleContent = document.querySelector('.article-content');
      const table = document.querySelector('.article-table-section');
      const gallery = document.querySelector('.article-gallery-section');
      if (!articleContent) return;

      const rect = articleContent.getBoundingClientRect();
      const tableRect = table?.getBoundingClientRect();
      const galleryRect = gallery?.getBoundingClientRect();

      const startOffset = window.innerHeight * 0.25;
      const endOffset = window.innerHeight * 0.15;

      const afterStart = rect.top < -startOffset;
      const beforeGallery = galleryRect ? galleryRect.top > endOffset : true;
      const afterEnd = galleryRect ? galleryRect.bottom < window.innerHeight : false;

      // ✅ מוצג אם עברו את ההתחלה ועדיין לא בגלריה
      // או אם עברו את סוף הכתבה
      setIsVisible((afterStart && beforeGallery) || afterEnd);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToGallery = () => {
    const gallery = document.querySelector('.article-gallery-section');
    if (gallery) gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button
      onClick={scrollToGallery}
      className={`fixed bottom-36 right-1 z-[5000] bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-500 ease-in-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <FaImages className="text-lg" />
      <span className="text-sm font-semibold">לגלריה</span>
    </button>
  );
}
