// components/MainGridContentDesktop.jsx
'use client';
import React, { useEffect, useState } from 'react';
import ArticleCard from './ArticleCards/ArticleCard';
import SectionWithHeader from './SectionWithHeader';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || process.env.STRAPI_API_URL;
const PLACEHOLDER_IMG = '/default-image.jpg';

/* ============================
   פונקציות תמונה (ללא שינוי)
===============================*/
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

function getMainImage(attrs) {
  let mainImage = PLACEHOLDER_IMG;
  let mainImageAlt = attrs.title || 'תמונה ראשית';

  if (attrs.image?.data?.attributes?.url) {
    mainImage = resolveImageUrl(attrs.image.data.attributes.url);
    mainImageAlt = attrs.image.data.attributes.alternativeText || mainImageAlt;
  } else if (attrs.image?.url) {
    mainImage = resolveImageUrl(attrs.image.url);
    mainImageAlt = attrs.image.alternativeText || mainImageAlt;
  } else if (attrs.gallery?.[0]?.url) {
    mainImage = resolveImageUrl(attrs.gallery[0].url);
    mainImageAlt = attrs.gallery[0].alternativeText || mainImageAlt;
  } else if (
    Array.isArray(attrs.external_media_links) &&
    attrs.external_media_links.length > 0
  ) {
    const valid = attrs.external_media_links.filter((l) => typeof l === 'string' && l.startsWith('http'));
    if (valid.length > 1) mainImage = valid[1].trim();
    else if (valid.length > 0) mainImage = valid[0].trim();
    mainImageAlt = 'תמונה ראשית מהמדיה החיצונית';
  }

  return { mainImage, mainImageAlt };
}

export default function MainGridContentDesktop() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================
      טעינת כתבות
   ===================*/
  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/main-grid', { cache: 'no-store' });
        const json = await res.json();

        const mapped = json.data?.map((a) => {
          const attrs = a.attributes || a;
          const { mainImage, mainImageAlt } = getMainImage(attrs);

          // בדיקה אם יש href בעברית
          const correctSlug = attrs.href || attrs.slug;

          return {
            id: a.id,
            title: attrs.title,
            slug: correctSlug,
            image: mainImage,
            imageAlt: mainImageAlt,
            category: attrs.category || 'general',
            date: attrs.date,
            subcategory: Array.isArray(attrs.subcategory)
              ? attrs.subcategory
              : [attrs.subcategory ?? 'general'],
            description: attrs.description,
            headline: attrs.headline || attrs.title,
            subdescription: attrs.subdescription,
            href: `/articles/${correctSlug}`,
            tags: attrs.tags || [],
          };
        }) || [];

        setArticles(mapped);
      } catch (err) {
        console.error('❌ שגיאה בטעינת כתבות:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  /* ===============================
     סדר קבוע של קטגוריות
  ================================*/
  const desiredOrder = ['news', 'reviews', 'blog', 'gear', 'laws'];

  const categories = [...new Set(articles.map((a) => a.category))].sort(
    (a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b)
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <div className="animate-pulse">
          <img 
            src="/OnMotorLogonoback.png" 
            alt="Loading..." 
            className="h-24 w-auto object-contain" // שנה את h-24 כדי לשלוט בגודל
          />
        </div>
        <p className="mt-4 text-gray-500 animate-bounce">טוען תוכן מעניין...</p>
      </div>
    );
  }
  if (articles.length === 0) return <p className="text-center text-gray-500">אין כתבות להצגה</p>;

  return (
    <div className="bg-white p-0 shadow space-y-0">
      {categories.map((category) => {
        const articlesInCategory = articles
          .filter((a) => a.category === category && a.slug)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        // ✅ התיקון הגדול: שינינו מ-5 ל-1.
        // עכשיו גם אם יש רק כתבה אחת בקטגוריה, היא תוצג!
        if (articlesInCategory.length < 1) return null;

        const [first, second, third, fourth, fifth] = articlesInCategory;

        return (
          <div key={category} className="space-y-0">
            <SectionWithHeader title={category} href={`/${category}`} />

            {/* 🔵 דסקטופ */}
            <div className="hidden md:grid grid-cols-3 gap-0 w-full">
              {first && (
                  <div className="col-span-1">
                    <ArticleCard article={first} size="medium" />
                  </div>
              )}
              {second && (
                  <div className="col-span-2">
                    <ArticleCard article={second} size="large" />
                  </div>
              )}
              {third && <div className="col-span-1"><ArticleCard article={third} size="small" /></div>}
              {fourth && <div className="col-span-1"><ArticleCard article={fourth} size="small" /></div>}
              {fifth && <div className="col-span-1"><ArticleCard article={fifth} size="small" /></div>}
            </div>

            {/* 🟢 מובייל */}
            <div className="md:hidden w-full space-y-0">
              {first && <ArticleCard article={first} size="large" />}
              
              <div className="grid grid-cols-2 gap-0">
                {second && <ArticleCard article={second} size="small" />}
                {third && <ArticleCard article={third} size="small" />}
              </div>

              <div className="grid grid-cols-2 gap-0">
                {fourth && <ArticleCard article={fourth} size="small" />}
                {fifth && <ArticleCard article={fifth} size="small" />}
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}