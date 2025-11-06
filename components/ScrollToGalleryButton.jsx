// components/ScrollToGalleryButton.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaImages } from 'react-icons/fa';

export default function ScrollToGalleryButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const content = document.querySelector('.article-content');
      const gallery = document.querySelector('.article-gallery-section');
      const comments = document.querySelector('.comments-section');
      if (!content) return;

      const contentRect = content.getBoundingClientRect();
      const galleryRect = gallery?.getBoundingClientRect();
      const commentsRect = comments?.getBoundingClientRect();

      const startVisible = contentRect.top < window.innerHeight * 0.6;
      const inGallery =
        galleryRect &&
        galleryRect.top < window.innerHeight * 0.8 &&
        galleryRect.bottom > window.innerHeight * 0.2;
      const afterEnd =
        galleryRect && galleryRect.bottom < window.innerHeight * 0.8;
      const inComments =
        commentsRect &&
        commentsRect.top < window.innerHeight &&
        commentsRect.bottom > 0;

      const isMobile = window.innerWidth <= 1024;

      // ✅ מופיע אחרי ההתחלה, נעלם בגלריה, מופיע שוב אחרי הסוף
      const show = (startVisible && !inGallery) || afterEnd;
      const hideAtComments = isMobile && inComments;
      const afterComments = commentsRect && commentsRect.bottom < window.innerHeight * 0.8;
      setIsVisible((show && !hideAtComments) || afterComments);
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
      className={`fixed bottom-25 right-1 z-[5000] bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-500 ease-in-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <FaImages className="text-lg" />
      <span className="text-sm font-semibold">לגלריה</span>
    </button>
  );
}
