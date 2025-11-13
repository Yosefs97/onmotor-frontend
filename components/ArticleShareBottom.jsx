// components/ArticleShareBottom.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FiShare2, FiCopy, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { MdMoreHoriz } from 'react-icons/md';
import { gsap } from 'gsap';

export default function ArticleShareBottom() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const buttonRef = useRef(null);
  const dropRef = useRef(null);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const [isDesktop, setIsDesktop] = useState(false);
  const [desktopLeft, setDesktopLeft] = useState(null);

  /* 🖥 זיהוי דסקטופ */
  useEffect(() => {
    const checkDevice = () => setIsDesktop(window.innerWidth > 1024);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  /* 📌 חישוב צד שמאל של עמוד הכתבה */
  useEffect(() => {
    if (!isDesktop) return;

    const calcPosition = () => {
      const article = document.querySelector('.article-content-wrapper');
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const fromLeft = rect.left;

      // כפתור משמאל לעמוד הכתבה (עם ריווח קטן)
      setDesktopLeft(fromLeft - 70);
    };

    calcPosition();
    window.addEventListener('resize', calcPosition);
    return () => window.removeEventListener('resize', calcPosition);
  }, [isDesktop]);

  /* 🎯 הכפתור יוצג בין הגלריה לתגובות */
  useEffect(() => {
    const handleScroll = () => {
      const gallery = document.querySelector('.article-gallery-section');
      const comments = document.querySelector('.comments-section');
      if (!gallery || !comments) return;

      const galleryRect = gallery.getBoundingClientRect();
      const commentsRect = comments.getBoundingClientRect();

      const shouldShow =
        galleryRect.bottom < window.innerHeight * 0.8 &&
        commentsRect.top > window.innerHeight * 0.2;

      setVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* 🎬 אנימציה */
  useEffect(() => {
    if (open && dropRef.current) {
      gsap.fromTo(
        dropRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, ease: 'power1.out' }
      );
    } else if (!open && dropRef.current) {
      gsap.to(dropRef.current, { opacity: 0, duration: 0.15 });
    }
  }, [open]);

  const handleCopy = () => navigator.clipboard.writeText(url);

  const handleShareAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch (err) {
        console.error(err);
      }
    } else handleCopy();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed left-180 z-[5000] transition-all duration-300"
      style={{
        bottom: isDesktop ? '150px' : '40px',
        left: isDesktop ? `${desktopLeft}px` : '10px',
      }}
    >
      <button
        ref={buttonRef}
        onClick={() => {
          if (collapsed) setCollapsed(false);
          else setOpen((o) => !o);
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300
          bg-red-600 hover:bg-red-700 text-white
          ${collapsed ? 'p-3 w-12 h-12 justify-center' : ''}
        `}
      >
        <FiShare2 className="w-5 h-5 text-white" />
        {!collapsed && <span>שתף כתבה</span>}
      </button>

      {/* תפריט השיתוף */}
      {open && !collapsed && (
        <div
          ref={dropRef}
          className="absolute bottom-14 left-0 w-52 bg-white text-black rounded-lg shadow-xl border border-gray-200"
        >
          <div className="flex justify-between items-center p-2 border-b border-gray-100">
            <span className="text-sm font-medium">שתף באמצעות</span>
            <button
              onClick={() => setCollapsed(true)}
              className="text-gray-500 hover:text-red-500"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
          >
            <FiCopy className="w-5 h-5 ml-2 text-gray-700" />
            <span className="flex-grow text-right">העתק קישור</span>
          </button>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
          >
            <FaWhatsapp className="w-5 h-5 ml-2 text-green-500" />
            <span className="flex-grow text-right">וואטסאפ</span>
          </a>

          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(document.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
          >
            <FaTwitter className="w-5 h-5 ml-2 text-blue-400" />
            <span className="flex-grow text-right">טוויטר</span>
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
          >
            <FaFacebook className="w-5 h-5 ml-2 text-blue-600" />
            <span className="flex-grow text-right">פייסבוק</span>
          </a>

          <a
            href={`https://www.tiktok.com/share?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
          >
            <FaTiktok className="w-5 h-5 ml-2 text-black" />
            <span className="flex-grow text-right">טיקטוק</span>
          </a>

          <button
            onClick={handleShareAPI}
            className="flex items-center w-full px-4 py-2 hover:bg-gray-100 border-t border-gray-100"
          >
            <MdMoreHoriz className="w-5 h-5 ml-2 text-gray-700" />
            <span className="flex-grow text-right">אפליקציות נוספות</span>
          </button>
        </div>
      )}
    </div>
  );
}
