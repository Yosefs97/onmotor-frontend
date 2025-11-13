// components/ScrollToCommentsButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaCommentDots } from 'react-icons/fa';

export default function ScrollToCommentsButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [desktopRight, setDesktopRight] = useState(20); // המיקום היחסי לכתבה

  useEffect(() => {
    const checkDevice = () => setIsDesktop(window.innerWidth > 1024);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  /* 🎯 חישוב מיקום כפתור ביחס לעמוד כתבה */
  useEffect(() => {
    if (!isDesktop) return;

    const calcPosition = () => {
      const article = document.querySelector('.article-content-wrapper');
      if (!article) return;

      const rect = article.getBoundingClientRect();

      // מרחק מימין של עמוד כתבה בתוך המסך
      const fromRight = window.innerWidth - rect.right;

      // נוסיף ריווח קטן
      setDesktopRight(fromRight + 20);
    };

    calcPosition();
    window.addEventListener('resize', calcPosition);
    return () => window.removeEventListener('resize', calcPosition);
  }, [isDesktop]);

  useEffect(() => {
    const handleScroll = () => {
      const content = document.querySelector('.article-content');
      const comments = document.querySelector('.comments-section');
      if (!content || !comments) return;

      const contentRect = content.getBoundingClientRect();
      const commentsRect = comments.getBoundingClientRect();

      const startVisible = contentRect.top < window.innerHeight * 0.6;
      const inComments =
        commentsRect.top < window.innerHeight * 0.8 &&
        commentsRect.bottom > window.innerHeight * 0.2;

      const isMobile = window.innerWidth <= 1024;

      setIsVisible(startVisible && !inComments);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToComments = () => {
    const comments = document.querySelector('.comments-section');
    if (comments)
      comments.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button
      onClick={scrollToComments}
      className={`fixed z-[5000] bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-500 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      style={{
        bottom: isDesktop ? '140px' : '60px',
        right: isDesktop ? `${desktopRight}px` : '10px',
      }}
    >
      <FaCommentDots className="text-lg" />
      <span className="text-sm font-semibold">לתגובות</span>
    </button>
  );
}
