// components/ScrollToCommentsButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaCommentDots } from 'react-icons/fa';

export default function ScrollToCommentsButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const content = document.querySelector('.article-content');
      const comments = document.querySelector('.comments-section');
      const sidebarMiddle = document.querySelector('.sidebar-middle-layer');
      if (!content || !comments) return;

      const contentRect = content.getBoundingClientRect();
      const commentsRect = comments.getBoundingClientRect();
      const sidebarRect = sidebarMiddle?.getBoundingClientRect();

      const startVisible = contentRect.top < window.innerHeight * 0.6;
      const inComments =
        commentsRect.top < window.innerHeight * 0.8 &&
        commentsRect.bottom > window.innerHeight * 0.2;
      const afterComments = commentsRect.bottom < window.innerHeight * 0.8;
      const inSidebar =
        sidebarRect && sidebarRect.top < window.innerHeight * 0.8;

      const isMobile = window.innerWidth <= 1024;

      // ✅ מופיע במהלך הקריאה, נעלם בתגובות ובסיידר
      const show = startVisible && !inComments;
      const showAgainAfter = isMobile && afterComments;
      setIsVisible((show || showAgainAfter) && !inSidebar);
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
      className={`fixed bottom-15 right-1 z-[5000] bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-500 ease-in-out
      ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <FaCommentDots className="text-lg" />
      <span className="text-sm font-semibold">לתגובות</span>
    </button>
  );
}
