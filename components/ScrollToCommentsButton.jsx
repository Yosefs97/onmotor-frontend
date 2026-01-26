// components/ScrollToCommentsButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaCommentDots } from 'react-icons/fa';

export default function ScrollToCommentsButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [desktopRight, setDesktopRight] = useState(20);

  /* 📌 זיהוי מחשב */
  useEffect(() => {
    const checkDevice = () => setIsDesktop(window.innerWidth > 1024);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  /* 📌 חישוב מיקום הכפתור ביחס לכתבה */
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

  /* 📌 לוגיקת הצגה/הסתרה */
  useEffect(() => {
    const handleScroll = () => {
      const content = document.querySelector('.article-content');
      const comments = document.querySelector('.comments-section');
      const similar = document.querySelector('.similar-articles-section');

      if (!content || !comments) return;

      const contentRect = content.getBoundingClientRect();
      const commentsRect = comments.getBoundingClientRect();
      const similarRect = similar ? similar.getBoundingClientRect() : null;

      const startVisible = contentRect.top < window.innerHeight * 0.6;

      const inComments =
        commentsRect.top < window.innerHeight * 0.8 &&
        commentsRect.bottom > window.innerHeight * 0.2;

      const inSimilar =
        similarRect && similarRect.top < window.innerHeight * 0.9;

      setIsVisible(startVisible && !inComments && !inSimilar);
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
      className={`fixed z-[5000] bg-orange-600 right-1 hover:bg-orange-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-500 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      style={{
        bottom: isDesktop ? '150px' : '70px',
        right: isDesktop ? `${desktopRight}px` : '4px',
      }}
    >
      <FaCommentDots className="text-lg" />
      <span className="text-sm font-semibold">לתגובות</span>
    </button>
  );
}
