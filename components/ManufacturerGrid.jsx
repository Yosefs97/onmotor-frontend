// /components/ManufacturerGrid.jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollSearchBar from './ScrollSearchBar';

export default function ManufacturerGrid() {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  useEffect(() => {
    async function fetchManufacturers() {
      try {
        const res = await fetch('/api/shopify/collections?limit=50');
        const data = await res.json();
        const items = data.items || [];

        // ✅ מיון אלפביתי
        items.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));

        setManufacturers(items);
      } catch (err) {
        console.error('Failed to fetch manufacturers:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchManufacturers();
  }, []);

  // 🎬 אנימציית "רמז גלילה" עדינה
  useEffect(() => {
    const el = containerRef.current;
    if (!el || hasUserScrolled) return;

    let startTime = null;
    const distance = 80; // כמה פיקסלים לזוז
    const duration = 1500; // משך האנימציה הכולל (מילישניות)

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const half = duration / 2;

      if (progress < half) {
        // גלילה ימינה
        el.scrollLeft = (progress / half) * distance;
      } else if (progress < duration) {
        // גלילה שמאלה חזרה
        el.scrollLeft = distance - ((progress - half) / half) * distance;
      } else {
        el.scrollLeft = 0;
        return; // עצירה בסוף
      }
      requestAnimationFrame(animate);
    };

    // מתחילים את האנימציה
    requestAnimationFrame(animate);

    // אם המשתמש גולל בעצמו — מפסיקים כל תנועה
    const handleScroll = () => setHasUserScrolled(true);
    el.addEventListener('scroll', handleScroll, { once: true });

    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasUserScrolled]);

  if (loading) return <p className="text-center py-8">טוען יצרנים...</p>;
  if (!manufacturers.length) return <p className="text-center py-8">לא נמצאו יצרנים</p>;

  return (
    <div>
      <ScrollSearchBar placeholder="חפש יצרן" containerRef={containerRef} />

      <div
        ref={containerRef}
        className="flex overflow-x-auto space-x-4 pb-4 px-2 snap-x snap-mandatory scroll-smooth bg-[#e60000] rounded-lg"
      >
        {manufacturers.map((m) => (
          <Link
            key={m.id}
            href={`/shop/vendor/${m.handle}`}
            data-name={m.title}
            className="min-w-[160px] flex-shrink-0 border border-white/50 bg-white rounded-lg p-4 shadow hover:shadow-xl transition snap-start"
          >
            {m.image?.url && (
              <div className="relative w-full h-24 mb-2">
                <Image
                  src={m.image.url}
                  alt={m.image.altText || m.title}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
            <p className="text-center font-semibold text-gray-900 hover:text-[#e60000] transition-colors duration-200">
              {m.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
