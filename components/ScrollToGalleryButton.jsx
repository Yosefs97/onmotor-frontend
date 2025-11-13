// components/ScrollToGalleryButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaImages } from 'react-icons/fa';

export default function ScrollToGalleryButton() {
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

  // ✔ חישוב מיקום יחסית לכתבה — כמו בכפתור התגובות
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

  // ✔ לוגיקת הופעה/היעלמות — זהה לכפתור התגובות
  useEffect(() => {
    const handleScroll = () => {
      const content = document.querySelector('.article-content');
      const gallery = document.querySelector('.article-gallery-section');
      if (!content || !gallery) return;

      const contentRect = content.getBoundingClientRect();
      const galleryRect = gallery.getBoundingClientRect();

      const startVisible = contentRect.top < window.innerHeight * 0.6;

      // בגלריה עצמה — הכפתור לא צריך להופיע
      const inGallery =
        galleryRect.top < window.innerHeight * 0.8 &&
        galleryRect.bottom > window.innerHeight * 0.2;

      setIsVisible(startVisible && !inGallery);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToGallery = () => {
    const gallery = document.querySelector('.article-gallery-section');
    if (gallery)
      gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button
      onClick={scrollToGallery}
      className={`fixed z-[5000] bg-green-600 right-1 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-500 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      style={{
        bottom: isDesktop ? '170px' : '80px',
        right: isDesktop ? `${desktopRight}px` : '8px',
      }}
    >
      <FaImages className="text-lg" />
      <span className="text-sm font-semibold">לגלריה</span>
    </button>
  );
}
