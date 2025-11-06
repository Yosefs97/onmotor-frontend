// components/ArticleShare.jsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FiShare2, FiCopy, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { MdMoreHoriz } from 'react-icons/md';
import { gsap } from 'gsap';

export default function ArticleShare() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState('bottom'); // 👈 מצב פתיחה דינמי
  const [interacting, setInteracting] = useState(false);
  const buttonRef = useRef(null);
  const dropRef = useRef(null);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const scrollTimeout = useRef(null);

  // 🎯 קובע כיוון פתיחה לפי מיקום הכפתור על המסך
  useEffect(() => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;

      if (rect.left < screenWidth / 3) setPosition('left'); // קרוב לצד שמאל
      else if (rect.right > (screenWidth / 3) * 2) setPosition('right'); // קרוב לצד ימין
      else setPosition('bottom'); // באמצע
    }
  }, [open]);

  // ✅ אנימציית פתיחה/סגירה
  useEffect(() => {
    if (open && dropRef.current) {
      gsap.fromTo(
        dropRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.25, ease: 'power1.out' }
      );
    } else if (!open && dropRef.current) {
      gsap.to(dropRef.current, { opacity: 0, duration: 0.15 });
    }
  }, [open]);

  // ✅ סגירה אחרי גלילה
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

  // 🧭 מחלקות פתיחה לפי מיקום
  const positionClass = {
    left: 'absolute left-0 origin-top-left mt-2',
    right: 'absolute right-0 origin-top-right mt-2',
    bottom: 'absolute left-1/2 -translate-x-1/2 origin-top mt-2',
  }[position];

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
      >
        <FiShare2 className="w-5 h-5 text-white" />
        <span>שתף</span>
      </button>

      {open && (
        <div
          ref={dropRef}
          onPointerEnter={() => setInteracting(true)}
          onPointerLeave={() => setInteracting(false)}
          onTouchStart={() => setInteracting(true)}
          onTouchEnd={() => setInteracting(false)}
          className={`${positionClass} w-40 bg-white text-black rounded shadow-lg z-50`}
        >
          <div className="flex justify-end p-2">
            <button onClick={() => setOpen(false)} className="focus:outline-none">
              <FiX className="w-5 h-5 text-gray-600" />
            </button>
          </div>

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
