// components/ScrollToGalleryButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaImages } from 'react-icons/fa';

export default function ScrollToGalleryButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [desktopRight, setDesktopRight] = useState(null); // רק לדסקטופ

  /* ✔ זיהוי מובייל/מחשב */
  useEffect(() => {
    const checkDevice = () => setIsDesktop(window.innerWidth > 1024);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  /* ✔ מחשבים – לחשב מיקום עמוד כתבה */
  useEffect(() => {
    if (!isDesktop) return;

    const calcRight = () => {
      const article = document.querySelector('.article-content-wrapper');
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const fromRight = window.innerWidth - rect.right;

      setDesktopRight(fromRight + 20);
    };

    calcRight();
    window.addEventListener('resize', calcRight);
    return () => window.removeEventListener('resize', calcRight);
  }, [isDesktop]);

  /* ✔ לוגיקה של הופעה/היעלמות */
  useEffect(() => {
    const handleScroll = () => {
      const content = document.querySelector('.article-content');
      const gallery = document.querySelector('.article-gallery-section');
      const comments = document.querySelector('.comments-section');
      const sidebarMiddle = document.querySelector('.sidebar-middle-layer');
      if (!content) return;

      const contentRect = content.getBoundingClientRect();
      const galleryRect = gallery?.getBoundingClientRect();
      const commentsRect = comments?.getBoundingClientRect();
      const sidebarRect = sidebarMiddle?.getBoundingClientRect();

      const startVisible = contentRect.top < window.innerHeight * 0.6;

      const inGallery =
        galleryRect &&
        galleryRect.top < window.innerHeight * 0.8 &&
        galleryRect.bottom > window.innerHeight * 0.2;

      const afterGallery =
        galleryRect && galleryRect.bottom < window.innerHeight * 0.8;

      const inComments =
        commentsRect &&
        commentsRect.top < window.innerHeight &&
        commentsRect.bottom > 0;

      const afterComments =
        commentsRect && commentsRect.bottom < window.innerHeight * 0.8;

      const inSidebar =
        sidebarRect && sidebarRect.top < window.innerHeight * 0.8;

      const isMobile = window.innerWidth <= 1024;

      const show = (startVisible && !inGallery) || afterGallery;
      const hideAtComments = isMobile && inComments;

      setIsVisible(((show && !hideAtComments) || afterComments) && !inSidebar);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToGallery = () => {
    const gallery = document.querySelector('.article-gallery-section');
    if (gallery) gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* 🎯 מובייל = ללא style  
     🎯 מחשב = הוספת style */
  const desktopStyle = isDesktop
    ? {
        right: desktopRight ? `${desktopRight}px` : '20px',
        bottom: '200px',
      }
    : {};

  return (
    <button
      onClick={scrollToGallery}
      className={`fixed bottom-25 right-1 z-[5000] bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-500 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      style={desktopStyle}
    >
      <FaImages className="text-lg" />
      <span className="text-sm font-semibold">לגלריה</span>
    </button>
  );
}
