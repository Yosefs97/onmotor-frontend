'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FiShare2, FiCopy, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { MdMoreHoriz } from 'react-icons/md';
import { gsap } from 'gsap';

export default function ArticleShareBottom() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const dropRef = useRef(null);
  
  // שימוש ב-window בצורה בטוחה (למניעת שגיאות צד שרת)
  const url = typeof window !== 'undefined' ? window.location.href : '';

  /* 🎬 אנימציה - נשאר זהה */
  useEffect(() => {
    if (open && dropRef.current) {
      gsap.fromTo(
        dropRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, ease: 'power1.out' }
      );
    }
  }, [open]);

  const handleCopy = () => {
      if (typeof navigator !== 'undefined') {
          navigator.clipboard.writeText(url);
          // אופציונלי: אפשר להוסיף כאן טוסט/הודעה שהועתק
      }
  };

  const handleShareAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch (err) {
        console.error(err);
      }
    } else handleCopy();
  };

  return (
    // הסרנו את fixed, left, bottom וכל החישובים.
    // relative - כדי שהתפריט הנפתח יתמקם ביחס לכפתור הזה
    <div className="relative inline-block z-10"> 
      
      {/* תפריט השיתוף - ממוקם אבסולוטית מעל הכפתור */}
      {open && !collapsed && (
        <div
          ref={dropRef}
          className="absolute bottom-full mb-3 left-0 w-52 bg-white text-black rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
        >
          <div className="flex justify-between items-center p-2 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">שתף באמצעות</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col">
            <button onClick={handleCopy} className="share-item">
              <FiCopy className="icon" /> <span>העתק קישור</span>
            </button>

            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="share-item">
              <FaWhatsapp className="icon text-green-500" /> <span>וואטסאפ</span>
            </a>

            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="share-item">
              <FaTwitter className="icon text-blue-400" /> <span>טוויטר</span>
            </a>

            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="share-item">
              <FaFacebook className="icon text-blue-600" /> <span>פייסבוק</span>
            </a>

             <a href={`https://www.tiktok.com/share?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="share-item">
              <FaTiktok className="icon text-black" /> <span>טיקטוק</span>
            </a>

            <button onClick={handleShareAPI} className="share-item border-t">
              <MdMoreHoriz className="icon" /> <span>עוד...</span>
            </button>
          </div>
        </div>
      )}

      {/* הכפתור הראשי */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-6 py-2 rounded-full shadow-md transition-all duration-300
          bg-red-600 hover:bg-red-700 text-white hover:shadow-lg transform active:scale-95
        `}
      >
        <FiShare2 className="w-5 h-5" />
        <span className="font-medium">שתף כתבה</span>
      </button>

      {/* סטיילים פנימיים לאייטמים בתפריט כדי לחסוך שכפול קוד */}
      <style jsx>{`
        .share-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 16px;
          transition: background-color 0.2s;
          font-size: 14px;
          color: #374151;
        }
        .share-item:hover {
          background-color: #f3f4f6;
        }
        .icon {
          width: 18px;
          height: 18px;
          margin-left: 10px; /* רווח משמאל לאייקון כי אנחנו ב-RTL */
        }
      `}</style>
    </div>
  );
}