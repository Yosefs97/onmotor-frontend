// components/TabLeftSidebar.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import useIsMobile from '@/hooks/useIsMobile';

const tabs = ['אחרונים', 'בדרכים', 'פופולרי'];
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

/* ✅ פונקציה מאוחדת לשחזור תמונות מכל מקור (Cloudinary / Strapi / יחסית) */
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return '/default-image.jpg';
  if (rawUrl.startsWith('http')) return rawUrl; // Cloudinary או אתר חיצוני
  return `${API_URL}${rawUrl.startsWith('/') ? rawUrl : `/uploads/${rawUrl}`}`;
}

/* 👇 פונקציה שמוציאה שם אתר נקי מתוך כתובת */
function extractDomainName(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    const parts = host.split('.');
    let base = '';
    if (parts.length >= 3 && ['co', 'org', 'net'].includes(parts[parts.length - 2])) {
      base = parts[parts.length - 3];
    } else {
      base = parts[0];
    }
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return 'Website';
  }
}

export default function TabLeftSidebar() {
  const isMobile = useIsMobile();
  const [hasInteracted, setHasInteracted] = useState(false);
  const scrollContainerRef = useRef(null);
  const sidebarRef = useRef(null);

  const [activeTab, setActiveTab] = useState('אחרונים');
  const [latestArticles, setLatestArticles] = useState([]);
  const [onRoadArticles, setOnRoadArticles] = useState([]);
  const [popularContent, setPopularContent] = useState([]);
  const [viralContent, setViralContent] = useState([]);
  const [victims, setVictims] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  /* ✅ normalizeItem מעודכן לשיטת Cloudinary */
  const normalizeItem = (obj, type = 'article') => {
    const a = obj.attributes || obj;

    // קביעת מקור (YouTube, TikTok וכו')
    let autoSource = '';
    if (a.url) {
      if (a.url.includes('youtube.com') || a.url.includes('youtu.be')) autoSource = 'YouTube';
      else if (a.url.includes('tiktok.com')) autoSource = 'TikTok';
      else if (a.url.includes('instagram.com')) autoSource = 'Instagram';
      else if (a.url.includes('facebook.com')) autoSource = 'Facebook';
      else autoSource = extractDomainName(a.url);
    }

    /* --- ⭐️ לוגיקת תמונות אחידה ⭐️ --- */
    let img = null;
    const gallery = a.gallery || [];

    if (type === 'latest-article') {
      const imgData = gallery?.[1] || gallery?.[0];
      img = resolveImageUrl(imgData?.url);
    } else if (type === 'onroad-article') {
      const imgData = gallery?.[2] || gallery?.[0];
      img = resolveImageUrl(imgData?.url);
    } else {
      img = resolveImageUrl(
        a.image?.data?.attributes?.url ||
        a.image?.url ||
        gallery?.[0]?.url
      );
    }

    // fallback למקרה שאין בכלל
    if (!img) img = '/default-image.jpg';
    /* --- ⭐️ סוף לוגיקת תמונות ⭐️ --- */

    return {
      id: obj.id,
      title: a.title || a.name || '',
      slug: a.slug || '',
      description: a.description || '',
      image: img,
      date: a.date?.split('T')[0] || a.publishedAt?.split('T')[0] || '',
      url: a.url || '',
      views: a.views ?? null,
      source: a.source || autoSource,
    };
  };

  /* ✅ שליפות מה־API */
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`${API_URL}/api/articles?sort=date:desc&populate=*`);
        const data = (await res.json()).data || [];
        setLatestArticles(data.map((a) => normalizeItem(a, 'latest-article')));
      } catch (err) {
        console.error('שגיאה בטעינת אחרונים:', err);
      }
    };

    const fetchOnRoad = async () => {
      try {
        const res = await fetch(`${API_URL}/api/articles?filters[tags_txt][$contains]=iroads&sort=date:desc&populate=*`);
        const data = (await res.json()).data || [];
        setOnRoadArticles(data.map((a) => normalizeItem(a, 'onroad-article')));
      } catch (err) {
        console.error("שגיאה בטעינת 'בדרכים':", err);
      }
    };

    const fetchPopular = async () => {
      try {
        const res = await fetch(`${API_URL}/api/populars?sort=date:desc&populate=*`);
        const data = (await res.json()).data || [];

        const withPreview = await Promise.all(
          data.map(async (item) => {
            const norm = normalizeItem(item, 'popular');

            /* --- ⭐️ לוגיקת משיכה חכמה לטאב פופולרי ⭐️ --- */
            // 1. אם יש תמונה ב־Strapi (כולל Cloudinary) – השתמש בה
            if (norm.image && norm.image !== '/default-image.jpg') return norm;

            // 2. אם אין תמונה ב־Strapi, נסה למשוך מ־preview API (Google metadata)
            if (norm.url) {
              try {
                const previewRes = await fetch(`/api/preview?url=${encodeURIComponent(norm.url)}`);
                const previewJson = await previewRes.json();
                if (previewJson?.image) norm.image = previewJson.image;
              } catch (err) {
                console.error('Preview fetch error:', err);
              }
            }

            // 3. fallback אחרון
            if (!norm.image) norm.image = '/default-image.jpg';
            return norm;
          })
        );

        setPopularContent(withPreview);
      } catch (err) {
        console.error('שגיאה בטעינת פופולרי:', err);
      }
    };

    const fetchViral = async () => {
      try {
        const res = await fetch(`${API_URL}/api/viral-contents?sort=views:desc&populate=*`);
        const data = (await res.json()).data || [];
        setViralContent(data.map((v) => normalizeItem(v, 'viral')));
      } catch (err) {
        console.error('שגיאה בטעינת ויראלי:', err);
      }
    };

    const fetchVictims = async () => {
      try {
        const res = await fetch(`${API_URL}/api/victims?sort=date:desc&populate=*`);
        const data = (await res.json()).data || [];
        setVictims(data.map((v) => normalizeItem(v, 'victim')));
      } catch (err) {
        console.error('שגיאה בטעינת נפגעים:', err);
      }
    };

    fetchLatest();
    fetchOnRoad();
    fetchPopular();
    fetchViral();
    fetchVictims();
  }, []);

  /* ✅ גלילה אנכית מתמשכת */
  useEffect(() => {
    if (isMobile) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const speed = 1;
    let frame;
    const step = () => {
      if (!isPaused) {
        container.scrollTop += speed;
        if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
          container.scrollTop = 0;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [activeTab, isPaused, isMobile]);

  useEffect(() => {
    if (!isMobile || !sidebarRef.current || !hasInteracted) return;
    setTimeout(() => {
      const y = sidebarRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, 0);
  }, [activeTab, isMobile, hasInteracted]);

  /* ✅ רינדור הפריטים לפי טאב */
  const getStyledContent = (items) => {
    return items.map((item, i) => {
      const even = i % 2 === 0;
      const bg = even ? 'bg-red-50 text-black' : 'bg-neutral-900 text-white';
      return (
        <a
          key={item.id}
          href={item.url || (item.slug ? `/articles/${item.slug}` : '#')}
          target={item.url ? '_blank' : '_self'}
          rel={item.url ? 'noopener noreferrer' : ''}
          className={`flex gap-2 items-start p-1 rounded transition-transform duration-200 ${bg} hover:scale-[1.03] hover:shadow-sm`}
        >
          <div className="w-20 h-14 relative rounded overflow-hidden flex-shrink-0">
            <Image
              src={item.image || '/default-image.jpg'}
              alt={item.title}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded"
            />
          </div>
          <div className="flex flex-col text-right">
            <p className="font-bold text-sm line-clamp-1">{item.title}</p>
            <p className={`text-xs ${even ? 'text-gray-700' : 'text-gray-300'} line-clamp-2`}>
              {item.description}
            </p>
            {item.date && (
              <span className={`text-xs ${even ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                {item.date}
              </span>
            )}
            {(item.views || item.source) && (
              <span className="text-xs text-gray-400 mt-1">
                {item.views ? `${item.views} צפיות` : ''}
                {item.views && item.source ? ' · ' : ''}
                {item.source || ''}
              </span>
            )}
          </div>
        </a>
      );
    });
  };

  let content = [];
  if (activeTab === 'אחרונים') content = getStyledContent(latestArticles);
  else if (activeTab === 'בדרכים') content = getStyledContent(onRoadArticles);
  else if (activeTab === 'פופולרי') content = getStyledContent(popularContent);
  else content = getStyledContent(viralContent);

  return (
    <div
      ref={sidebarRef}
      className={`flex flex-col min-h-0 bg-white shadow-md w-full text-sm ${isMobile ? 'w-screen rounded-none' : ''}`}
    >
      <div
        className="flex border-b text-sm font-semibold bg-white sticky top-0 z-10 shadow-sm"
        dir="rtl"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setHasInteracted(true);
            }}
            className={`w-1/3 text-center py-2 ${
              activeTab === tab
                ? 'text-black border-b-2 border-red-500 bg-white'
                : 'text-gray-500 bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="custom-scrollbar overflow-x-hidden p-1 space-y-1 flex-1 overflow-y-auto max-h-[380px]"
        dir="rtl"
      >
        {content}
      </div>
    </div>
  );
}
