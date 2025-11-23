// components/MainGridContentDesktop.jsx
'use client';
import React from 'react';
import ArticleCard from './ArticleCards/ArticleCard';
import SectionWithHeader from './SectionWithHeader';

export default function MainGridContentDesktop({ articles = [] }) {
  if (!articles || !articles.length) {
    return <p className="text-center text-gray-500">טוען כתבות...</p>;
  }

  const desiredOrder = ['news', 'reviews', 'blog', 'gear'];

  const categories = [...new Set(articles.map(a => a.category))].sort(
    (a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b)
  );

  return (
    <div className="bg-white p-0 shadow space-y-0">
      {categories.map(category => {
        const articlesInCategory = articles
          .filter(a => a.category === category && a.slug)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        if (articlesInCategory.length < 5) return null;

        const [first, second, third, fourth, fifth] = articlesInCategory;

        return (
          <div key={category} className="space-y-0">
            <SectionWithHeader title={category} href={`/${category}`} />

            {/* דסקטופ */}
            <div className="hidden md:grid grid-cols-3 gap-0 w-full">
              <div className="col-span-1">
                <ArticleCard article={first} size="medium" />
              </div>
              <div className="col-span-2">
                <ArticleCard article={second} size="large" />
              </div>
              <div className="col-span-1">
                <ArticleCard article={third} size="small" />
              </div>
              <div className="col-span-1">
                <ArticleCard article={fourth} size="small" />
              </div>
              <div className="col-span-1">
                <ArticleCard article={fifth} size="small" />
              </div>
            </div>

            {/* מובייל */}
            <div className="md:hidden w-full space-y-0">
              <ArticleCard article={first} size="large" />

              <div className="grid grid-cols-2 gap-0">
                <ArticleCard article={second} size="small" />
                <ArticleCard article={third} size="small" />
              </div>

              <div className="grid grid-cols-2 gap-0">
                <ArticleCard article={fourth} size="small" />
                <ArticleCard article={fifth} size="small" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
