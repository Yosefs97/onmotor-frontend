//components/LimitedArticles.jsx
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
    if (isExpanded) {
      setVisibleCount(rowsToShow * itemsPerRow);

      setTimeout(() => {
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      setVisibleCount(Math.min(visibleCount + rowsToShow * itemsPerRow, totalArticles));

      setTimeout(() => {
        buttonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        {visibleArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
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
