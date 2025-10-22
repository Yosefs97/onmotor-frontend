// components/ArticleCards/ArticleCard.jsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function ArticleCard({ article, size = 'small' }) {
  const [isTouched, setIsTouched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchStart = () => setIsTouched(true);

  // 🟢 נבנה תמיד כתובת תמונה תקינה
  let imageUrl = '';
  if (typeof article.image === 'string') {
    imageUrl = article.image;
  } else if (article.image?.url) {
    imageUrl = `${API_URL}${article.image.url}`;
  } else if (article.cover?.data?.attributes?.url) {
    imageUrl = `${API_URL}${article.cover.data.attributes.url}`;
  }

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
      href={article.href || `/articles/${article.slug}`}
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
            ${isMobile
              ? 'bg-[#e60000]/90'
              : isTouched
                ? 'bg-[#e60000]/150'
                : 'bg-gradient-to-t from-black/90 via-black/70 to-transparent  group-hover:bg-[#e60000]/80'
            }`}
        >
          <h3 className={`${titleSize} transition-all duration-300 ${isMobile ? 'font-normal' : 'font-bold'}`}>
            {article.headline || article.title}
          </h3>

          {!isMobile && (
            <p className={`${descSize} overflow-hidden transition-all duration-300
              ${isTouched
                ? 'max-h-20 opacity-100'
                : 'max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100'}`}>
              {article.description}
            </p>
          )}

          <p className={`text-s mt-1 text-white/80 
            ${(isMobile && isTouched) || (!isMobile) ? 'block' : 'hidden group-hover:block'}`}>
            {formatDate(article.date)}
          </p>
        </div>
      </div>
    </Link>
  );
}
