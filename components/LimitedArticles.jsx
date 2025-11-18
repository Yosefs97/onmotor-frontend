'use client';
import React, { useState, useRef } from 'react';
import ArticleCard from './ArticleCards/ArticleCard';

export default function LimitedArticles({ articles, rowsToShow = 2 }) {
  const [visibleCount, setVisibleCount] = useState(rowsToShow * 3);
  const gridRef = useRef(null);
  const buttonRef = useRef(null);

  const itemsPerRow = 3;
  const totalArticles = articles.length;
  const isExpanded = visibleCount >= totalArticles;

  const handleToggle = () => {
    const previousCount = visibleCount; // ⭐ כמה היו לפני פתיחה/סגירה

    if (isExpanded) {
      // ⭐ מצב סגירה — חזרה לראש הרשימה
      setVisibleCount(rowsToShow * itemsPerRow);

      setTimeout(() => {
        gridRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

    } else {
      // ⭐ מצב פתיחה — חשיפת שורות נוספות
      const newCount = Math.min(
        visibleCount + rowsToShow * itemsPerRow,
        totalArticles
      );

      setVisibleCount(newCount);

      setTimeout(() => {
        // ⭐ המתנה שה־DOM יסיים לבנות את הכרטיסים החדשים
        const firstNew = document.querySelector(
          `[data-article-index="${previousCount}"]`
        );

        if (firstNew) {
          const rect = firstNew.getBoundingClientRect();
          const scrollY = window.scrollY + rect.top - 80; 
          // ⭐ מרווח 80px מלמעלה — ניתן לשנות לטעמו שלך

          window.scrollTo({
            top: scrollY,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  const visibleArticles = articles.slice(0, visibleCount);

  return (
    <div className="flex flex-col">
      <div
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-0"
      >
        {visibleArticles.map((article, index) => (
          <div key={article.id} data-article-index={index}>
            <ArticleCard article={article} />
          </div>
        ))}
      </div>

      {totalArticles > rowsToShow * itemsPerRow && (
        <div className="text-center" ref={buttonRef}>
          <button
            onClick={handleToggle}
            className="inline-flex items-center bg-red-600 text-white px-6 py-1 transition-all duration-300 hover:bg-red-700 active:scale-105"
          >
            {isExpanded ? 'הסתר כתבות' : 'הצג עוד כתבות'}
            <span
              className={`transform transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            >
              ▼
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
