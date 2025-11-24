// /components/ManufacturerGrid.jsx
'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollSearchBar from './ScrollSearchBar';

export default function ManufacturerGrid({ manufacturers }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // 🎬 אנימציית "רמז גלילה"
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let start = null;
    const maxOffset = 60;
    const duration = 1000;

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

  if (!manufacturers.length)
    return <p className="text-center py-8">לא נמצאו יצרנים</p>;

  return (
    <div>
      <ScrollSearchBar placeholder="חפש יצרן או החלק שמאלה" containerRef={containerRef} />

      <div
        ref={containerRef}
        className="scroll-container flex overflow-x-scroll space-x-4 pb-4 px-2 snap-x snap-mandatory scroll-smooth"
      >
        {manufacturers.map((m) => (
          <Link
            key={m.id}
            href={`/shop/vendor/${m.handle}`}
            prefetch={false}
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
