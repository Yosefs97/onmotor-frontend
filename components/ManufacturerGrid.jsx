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

  if (loading) return <p className="text-center py-8">טוען יצרנים...</p>;
  if (!manufacturers.length) return <p className="text-center py-8">לא נמצאו יצרנים</p>;

  return (
    <div>
      <ScrollSearchBar placeholder="חפש יצרן" containerRef={containerRef} />

      <div
        ref={containerRef}
        className="flex overflow-x-auto space-x-4 pb-4 px-2 snap-x snap-mandatory"
      >
        {manufacturers.map((m) => (
          <Link
            key={m.id}
            href={`/shop/vendor/${m.handle}`}
            data-name={m.title}
            className="min-w-[160px] flex-shrink-0 border rounded-lg p-4 shadow hover:shadow-lg transition snap-start"
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
            <p className="text-center font-semibold">{m.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
