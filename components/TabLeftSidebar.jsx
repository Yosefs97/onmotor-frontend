// components/TabLeftSidebar.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useIsMobile from '@/hooks/useIsMobile';

const tabs = ['אחרונים', 'בדרכים', 'פופולרי'];

/* 👇 פונקציה שמוציאה שם אתר נקי מתוך כתובת (למקרה שאין source מהשרת) */
function extractDomainName(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    const parts = host.split('.');
    let base = '';
    if (
      parts.length >= 3 &&
      ['co', 'org', 'net'].includes(parts[parts.length - 2])
    ) {
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
  const [isPaused, setIsPaused] = useState(false);

  /* ✅ שליפה אחת מהשרת */
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const res = await fetch('/api/sidebar-left');
        if (!res.ok) {
          console.error('שגיאה בטעינת sidebar-left:', res.status);
          return;
        }
        const json = await res.json();
        setLatestArticles(json.latest || []);
        setOnRoadArticles(json.onRoad || []);
        setPopularContent(json.popular || []);
      } catch (err) {
        console.error('שגיאה בטעינת sidebar-left:', err);
      }
    };

    fetchSidebarData();
  }, []);

  /* ✅ גלילה אנכית מתמשכת לדסקטופ */
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

  /* ✅ גלילה למיקום ה-sidebar במובייל לאחר בחירת טאב */
  useEffect(() => {
    if (!isMobile || !sidebarRef.current || !hasInteracted) return;
    setTimeout(() => {
      const y = sidebarRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, 0);
  }, [activeTab, isMobile, hasInteracted]);

  /* ⭐️ רכיב תוכן שנחסוך בו כפילות */
  function CardContent({ item, even, source }) {
    return (
      <>
        <div className="w-20 h-14 relative rounded overflow-hidden flex-shrink-0">
          <Image
            src={item.image || '/default-image.jpg'}
            alt={item.title || ''}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded"
          />
        </div>

        <div className="flex flex-col text-right">
          <p className="font-bold text-sm line-clamp-1">{item.title}</p>

          <p
            className={`text-xs ${
              even ? 'text-gray-700' : 'text-gray-300'
            } line-clamp-2`}
          >
            {item.description}
          </p>

          {item.date && (
            <span
              className={`text-xs ${
                even ? 'text-gray-500' : 'text-gray-400'
              } mt-1`}
            >
              {item.date}
            </span>
          )}

          {(item.views || source) && (
            <span className="text-xs text-gray-400 mt-1">
              {item.views ? `${item.views} צפיות` : ''}
              {item.views && source ? ' · ' : ''}
              {source || ''}
            </span>
          )}
        </div>
      </>
    );
  }

  /* ⭐️ הפונקציה שמחליטה אם להשתמש ב־Link או ב־a */
  const getStyledContent = (items) => {
    return items.map((item, i) => {
      const even = i % 2 === 0;
      const bg = even ? 'bg-red-50 text-black' : 'bg-neutral-900 text-white';

      const source = item.source || (item.url ? extractDomainName(item.url) : '');

      const isExternal = item.url && item.url.startsWith('http');
      const internalHref = !isExternal && item.slug ? `/articles/${item.slug}` : null;

      return (
        <div key={item.id}>
          {isExternal ? (
            /* 🔗 חיצוני — נפתח בטאב חדש */
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex gap-2 items-start p-1 rounded transition-transform duration-200 ${bg} hover:scale-[1.03] hover:shadow-sm`}
            >
              <CardContent item={item} even={even} source={source} />
            </a>
          ) : (
            /* 🔗 פנימי — SPA ללא טעינה מחדש */
            <Link
              href={internalHref}
              className={`flex gap-2 items-start p-1 rounded transition-transform duration-200 ${bg} hover:scale-[1.03] hover:shadow-sm`}
            >
              <CardContent item={item} even={even} source={source} />
            </Link>
          )}
        </div>
      );
    });
  };

  let content = [];
  if (activeTab === 'אחרונים') content = getStyledContent(latestArticles);
  else if (activeTab === 'בדרכים') content = getStyledContent(onRoadArticles);
  else if (activeTab === 'פופולרי') content = getStyledContent(popularContent);

  return (
    <div
      ref={sidebarRef}
      className={`flex flex-col min-h-0 bg-white shadow-md w-full text-sm ${
        isMobile ? 'w-screen rounded-none' : ''
      }`}
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
