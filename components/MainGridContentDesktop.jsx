// components/MainGridContentDesktop.jsx
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ArticleCard from './ArticleCards/ArticleCard';
import { labelMap, linkLabelMap } from '@/utils/labelMap';

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
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full bg-om-void">
        <div className="animate-pulse">
          <img 
            src="/OnMotorLogonoback.png" 
            alt="Loading..." 
            className="h-24 w-auto object-contain"
          />
        </div>
        <p className="mt-4 text-om-ember font-black tracking-racing uppercase animate-bounce">טוען כתבות...</p>
      </div>
    );
  }
  if (articles.length === 0) return <p className="text-center text-om-mist bg-om-void py-16 font-bold tracking-racing uppercase">אין כתבות להצגה</p>;

  const featured = [...articles]
    .filter((a) => a.slug)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return (
    <div className="bg-om-void p-0 space-y-0 text-om-chrome">
      {featured && (
        <section className="relative mb-1">
          <ArticleCard article={featured} size="hero" />
        </section>
      )}

      {categories.map((category) => {
        const articlesInCategory = articles
          .filter((a) => a.category === category && a.slug && a.id !== featured?.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        // ✅ התיקון הגדול: שינינו מ-5 ל-1.
        // עכשיו גם אם יש רק כתבה אחת בקטגוריה, היא תוצג!
        if (articlesInCategory.length < 1) return null;

        const [first, second, third, fourth, fifth] = articlesInCategory;
        const titleHeb = labelMap[category] || category;
        const linkLabel = linkLabelMap[category] || 'לכל הכתבות';

        return (
          <div key={category} className="space-y-0">
            <div className="relative flex justify-between items-center px-4 py-3 bg-om-asphalt border-y border-om-steel">
              <Link href={`/${category}`} prefetch={false}>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tightish text-white hover:text-om-ember transition-colors duration-300">
                  {titleHeb}
                </h2>
              </Link>
              <Link
                href={`/${category}`}
                prefetch={false}
                className="text-[10px] md:text-xs font-black tracking-racing uppercase text-om-ember hover:text-om-blaze"
              >
                {linkLabel}
              </Link>
            </div>

            {/* 🔵 דסקטופ */}
            <div className="hidden md:grid grid-cols-12 gap-1 w-full">
              {first && (
                <div className="col-span-8">
                  <ArticleCard article={first} size="large" />
                </div>
              )}
              {second && (
                <div className="col-span-4">
                  <ArticleCard article={second} size="medium" />
                </div>
              )}
              {third && (
                <div className="col-span-3">
                  <ArticleCard article={third} size="small" />
                </div>
              )}
              {fourth && (
                <div className="col-span-5">
                  <ArticleCard article={fourth} size="small" />
                </div>
              )}
              {fifth && (
                <div className="col-span-4">
                  <ArticleCard article={fifth} size="small" />
                </div>
              )}
            </div>

            {/* 🟢 מובייל */}
            <div className="md:hidden w-full grid grid-cols-2 gap-1">
              {first && (
                <div className="col-span-2">
                  <ArticleCard article={first} size="large" />
                </div>
              )}
              {second && <ArticleCard article={second} size="small" />}
              {third && <ArticleCard article={third} size="small" />}
              {fourth && <ArticleCard article={fourth} size="small" />}
              {fifth && <ArticleCard article={fifth} size="small" />}
            </div>

          </div>
        );
      })}
    </div>
  );
}