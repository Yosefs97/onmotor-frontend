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
  const animationRef = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);

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

  // 🎬 אנימציית "רמז גלילה"
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let start = null;
    const maxOffset = 60; // כמה פיקסלים לזוז
    const duration = 1000; // כמה זמן האנימציה

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const offset = Math.sin((progress / duration) * Math.PI) * maxOffset;
      el.scrollLeft = offset;

      if (!hasScrolled && progress < duration * 2) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationRef.current);
      }
    };

    const handleUserScroll = () => {
      setHasScrolled(true);
      cancelAnimationFrame(animationRef.current);
    };

    el.addEventListener('scroll', handleUserScroll, { once: true });
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      el.removeEventListener('scroll', handleUserScroll);
      cancelAnimationFrame(animationRef.current);
    };
  }, [hasScrolled]);

  if (loading) return <p className="text-center py-8">טוען יצרנים...</p>;
  if (!manufacturers.length) return <p className="text-center py-8">לא נמצאו יצרנים</p>;

  return (
    <div>
      <ScrollSearchBar placeholder="חפש יצרן" containerRef={containerRef} />

      <div
        ref={containerRef}
        className="scroll-container flex overflow-x-auto space-x-4 pb-4 px-2 snap-x snap-mandatory scroll-smooth"
      >
        {manufacturers.map((m) => (
          <Link
            key={m.id}
            href={`/shop/vendor/${m.handle}`}
            data-name={m.title}
            className="min-w-[160px] flex-shrink-0 border rounded-lg p-4 shadow hover:shadow-lg transition snap-start bg-white"
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
