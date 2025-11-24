///C:\Users\yosef\Desktop\onmotor-frontend\components\ArticleCards\ArticleCard.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ArticleCard({ article, size = 'small' }) {
  const [isTouched, setIsTouched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 👇 חדש — זיהוי מיקום במרחב
  const [showDate, setShowDate] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 👇 חדש — IntersectionObserver למובייל
  useEffect(() => {
    if (!isMobile || !cardRef.current) return;

    const elem = cardRef.current;
    const screenHeight = window.innerHeight;
    const margin = screenHeight / 3;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowDate(true);
        } else {
          setShowDate(false);
        }
      },
      {
        root: null,
        threshold: 0.4,
        rootMargin: `-${margin}px 0px -${margin}px 0px`
      }
    );

    observer.observe(elem);
    return () => observer.disconnect();
  }, [isMobile]);

  const handleTouchStart = () => setIsTouched(true);

  const imageUrl = article.image || '/default-image.jpg';
  const imageAltText = article.imageAlt || article.title || 'Article image';

  const isLarge = size === 'large';
  const aspectClass = isLarge ? 'aspect-[2/1]' : 'aspect-square';
  const titleSize = isLarge ? 'text-lg' : 'text-sm';
  const descSize = isLarge ? 'text-base' : 'text-xs';
  const paddingSize = isLarge ? 'pt-0 px-2 pb-0' : 'pt-0 px-1 pb-0';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link
      ref={cardRef}   // 👈 חדש — כדי למדוד את מיקום הכרטיס
      href={article.href || `/articles/${article.slug}`}
      prefetch={false}  // 👈 התיקון כאן: מונע טעינה אוטומטית בעת גלילה
      className="group block relative overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] w-full"
      onTouchStart={handleTouchStart}
    >
      <div className={`relative ${aspectClass}`}>
        {imageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={imageAltText}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
            אין תמונה
          </div>
        )}

        <div
          className={`absolute bottom-0 w-full text-white ${paddingSize} transition-all duration-300
            ${
              isMobile
                ? 'bg-transparent'
                : isTouched
                ? 'bg-[#e60000]/150'
                : 'bg-gradient-to-t from-black/110 via-black/90 to-black/40 group-hover:bg-[#e60000]/80'
            }
          `}
        >
          {/* ⭐ במובייל כותרת עם רקע שקוף */}
          <h3
            className={`${titleSize} transition-all duration-300 ${
              isMobile
                ? 'font-bold bg-black/30 box-decoration-clone px-1 rounded-sm'
                : 'font-bold'
            }`}
          >
            {article.title || article.headline}
          </h3>

          {!isMobile && (
            <p
              className={`${descSize} overflow-hidden transition-all duration-300
                ${
                  isTouched
                    ? 'max-h-20 opacity-100'
                    : 'max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100'
                }`}
            >
              {article.description}
            </p>
          )}

          {/* 👇 חדש — הצגת התאריך במובייל לפי השליש האמצעי בלבד */}
          <p
            className={`text-s mt-1 text-white/80 
              ${isMobile ? (showDate ? 'block' : 'hidden') : 'block'}
            `}
          >
            {formatDate(article.date)}
          </p>
        </div>
      </div>
    </Link>
  );
}
