'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { labelMap } from '@/utils/labelMap';

export default function ArticleCard({ article, size = 'small' }) {
  const [isTouched, setIsTouched] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!cardRef.current) return;

    const elem = cardRef.current;
    const screenHeight = window.innerHeight;
    const margin = screenHeight / 3;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowDate(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.4,
        rootMargin: `-${margin}px 0px -${margin}px 0px`
      }
    );

    observer.observe(elem);
    return () => observer.disconnect();
  }, []);

  const handleTouchStart = () => setIsTouched(true);

  const handleMouseEnter = () => {
    const img = cardRef.current?.querySelector('img');
    if (img) gsap.to(img, { scale: 1.1, duration: 0.7, ease: 'power3.out' });
  };

  const handleMouseLeave = () => {
    const img = cardRef.current?.querySelector('img');
    if (img) gsap.to(img, { scale: 1, duration: 0.55, ease: 'power3.inOut' });
  };

  const imageUrl = article.image || '/default-image.jpg';
  const imageAltText = article.imageAlt || article.title || 'Article image';

  const isHero = size === 'hero';
  const isLarge = size === 'large';
  const isMedium = size === 'medium';

  // 👇 כאן הקטנו את הגובה של כתבת ההירו למחשב (60vh במקום 78vh)
  const frameClass = isHero
    ? 'md:min-h-[60vh] md:h-[60vh]' 
    : isLarge
    ? 'h-full min-h-[240px] md:min-h-[360px]'
    : isMedium
    ? 'h-full min-h-[240px] md:min-h-[360px]'
    : 'h-full min-h-[170px] md:min-h-[220px]';

  const titleSize = isHero
    ? 'text-4xl sm:text-5xl md:text-7xl lg:text-8xl'
    : isLarge
    ? 'text-2xl md:text-5xl lg:text-6xl'
    : isMedium
    ? 'text-xl md:text-3xl lg:text-4xl'
    : 'text-sm md:text-lg lg:text-xl';

  const descSize = isHero ? 'text-base md:text-xl lg:text-2xl' : isLarge ? 'text-sm md:text-lg' : 'text-xs md:text-sm';
  const paddingSize = isHero ? 'p-5 md:p-10' : isLarge ? 'p-4 md:p-6' : 'p-3 md:p-4';
  const categoryLabel = labelMap[article.category] || article.category || '';

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
      ref={cardRef}
      href={article.href || `/articles/${article.slug}`}
      prefetch={false}
      // 👇 הוספנו תנאי שמסתיר את הכתבה במובייל רק אם היא כתבת ה-Hero
      className={`group relative h-full w-full overflow-hidden bg-om-carbon border border-om-steel hover:border-om-ember transition-colors duration-300 ${frameClass} ${
        isHero ? 'hidden md:block' : 'block'
      }`}
      onTouchStart={handleTouchStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-full w-full overflow-hidden">
        {imageUrl ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={imageUrl}
              alt={imageAltText}
              fill
              sizes={isHero ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
              className="object-cover w-full h-full will-change-transform"
              priority={isHero}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-om-steel text-om-mist relative z-0">
            אין תמונה
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-om-void via-om-void/55 to-transparent z-0" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-om-ember/35 via-transparent to-om-blaze/10 transition-opacity duration-500 z-0" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(255,59,0,0.04)_10px,rgba(255,59,0,0.04)_11px)] z-0" />
        <div className="absolute top-0 right-0 h-full w-[3px] bg-om-ember z-10" />
        <div className="absolute top-0 left-0 w-10 h-[2px] bg-om-blaze z-10" />

        <div
          className={`absolute bottom-0 w-full text-white z-10 ${paddingSize} transition-all duration-300 bg-transparent ${isTouched ? 'md:bg-om-ember/80' : ''}`}
        >
          {categoryLabel && (
            <p className="mb-2 text-[10px] md:text-xs lg:text-sm font-black tracking-racing uppercase text-om-ember">
              {isHero ? 'Featured / ' : ''}{categoryLabel}
            </p>
          )}

          <h3
            className={`${titleSize} font-black uppercase leading-[1.12] tracking-tightish transition-all duration-300 bg-om-void/40 box-decoration-clone px-1 md:bg-transparent md:px-0`}
          >
            {article.title || article.headline}
          </h3>

          <p
            className={`${descSize} mt-3 text-om-chrome/90 overflow-hidden transition-all duration-300 hidden md:block
              ${
                isTouched
                  ? 'max-h-24 opacity-100'
                  : 'max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100'
              }`}
          >
            {article.description}
          </p>

          <p
            className={`text-[10px] md:text-xs lg:text-sm mt-3 font-bold tracking-racing uppercase text-om-mist
              ${showDate ? 'block' : 'hidden'} md:block
            `}
          >
            {isMounted ? formatDate(article.date) : ''}
          </p>
        </div>
      </div>
    </Link>
  );
}