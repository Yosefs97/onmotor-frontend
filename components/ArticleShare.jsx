//components\ArticleShare.jsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
// שימוש ב-react-icons במקום lucide-react
import { FiShare2, FiCopy, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { MdMoreHoriz } from 'react-icons/md';
import { gsap } from 'gsap';

export default function ArticleShare() {
  const [open, setOpen] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const dropRef = useRef(null);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const scrollTimeout = useRef(null);

  // אנימציה של פתיחה/סגירה באמצעות GSAP
  useEffect(() => {
    if (open && dropRef.current) {
      gsap.fromTo(
        dropRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power1.out' }
      );
    } else if (!open && dropRef.current) {
      gsap.to(dropRef.current, { scale: 0.8, opacity: 0, duration: 0.2, ease: 'power1.in' });
    }
  }, [open]);

  // סגירה אוטומטית לאחר גלילה (אם לא בתוך החלון)
  useEffect(() => {
    const handleScroll = () => {
      if (open && !interacting) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => setOpen(false), 500);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout.current);
    };
  }, [open, interacting]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    // ניתן להוסיף Toast כאן
  };

  const handleShareAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch (err) {
        console.error(err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
      >
        <FiShare2 className="w-5 h-5 text-white" />
        <span>שתף</span>
      </button>

      {open && (
        <div
          ref={dropRef}
          // mouse & touch interaction to prevent scroll-close
          onPointerEnter={() => setInteracting(true)}
          onPointerLeave={() => setInteracting(false)}
          onTouchStart={() => setInteracting(true)}
          onTouchEnd={() => setInteracting(false)}
          className="absolute left-0 origin-top-left md:left-auto md:right-0 md:origin-top-right mt-2 w-60 bg-white text-black rounded shadow-lg z-30"
        >
          {/* כפתור סגירה */}
          <div className="flex justify-end p-2">
            <button
              onClick={() => setOpen(false)}
              className="focus:outline-none"
            >
              <FiX className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* אפשרויות שיתוף */}
          <button
            onClick={handleCopy}
            className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
          >
            <FiCopy className="w-5 h-5 ml-2 text-gray-700" />
            <span className="flex-grow text-right">העתק כתובת</span>
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
            href={`https://www.instagram.com/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
          >
            <FaInstagram className="w-5 h-5 ml-2 text-pink-500" />
            <span className="flex-grow text-right">אינסטגרם</span>
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
            className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
          >
            <MdMoreHoriz className="w-5 h-5 ml-2 text-gray-700" />
            <span className="flex-grow text-right">אפליקציות נוספות</span>
          </button>
        </div>
      )}
    </div>
  );
}
