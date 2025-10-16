///components\MasonryLayout.jsx
'use client';
import React from 'react';
import ArticleCard from './ArticleCards/ArticleCard';

export default function MasonryLayout({ articles }) {
  // סינון כתבות שמוגדרות להצגה בלבד
  const filteredArticles = articles.filter(article => article.display !== false);

  return (
    <div className="columns-3 sm:columns-2 lg:columns-3 gap-0 space-y-0  px-0">
      {filteredArticles.map((article, i) => (
        <div key={article.id || article.slug || i} className="break-inside-avoid">
          <ArticleCard article={article} />
        </div>
      ))}
    </div>
  );
}
