// /app/shop/vendor/[vendor]/page.jsx
'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import Image from 'next/image';
import Link from 'next/link';
import ScrollSearchBar from '@/components/ScrollSearchBar';

export default function VendorPage() {
  const { vendor: vendorParam } = useParams();
  const searchParams = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const vendor = filters.vendor || vendorParam;

  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // ⚙️ שליפת דגמים מה-API
  useEffect(() => {
    const fetchVendorModels = async () => {
      setLoading(true);

      const cleanFilters = { ...filters };
      ['year', 'yearFrom', 'yearTo'].forEach((key) => {
        if (cleanFilters[key] === '0' || cleanFilters[key] === 0) delete cleanFilters[key];
      });

      const params = new URLSearchParams({ vendor, ...cleanFilters, limit: '100' });
      const res = await fetch(`/api/shopify/search?${params.toString()}`);
      const json = await res.json();

      const items = json.items || [];
      const modelMap = {};

      items.forEach((p) => {
        const modelTag = p.tags.find((t) => t.startsWith('model:'));
        if (modelTag) {
          const modelName = modelTag.replace('model:', '').trim();
          if (!modelMap[modelName]) {
            modelMap[modelName] = {
              name: modelName,
              image: p.images?.edges?.[0]?.node?.url || null,
              handle: modelName.toLowerCase().replace(/\s+/g, '-'),
            };
          }
        }
      });

      const modelsArray = Object.values(modelMap);
      modelsArray.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

      setModels(modelsArray);
      setLoading(false);
    };

    fetchVendorModels();
  }, [vendor, JSON.stringify(filters)]);

  // 🎬 אנימציית "רמז גלילה" — כמו אצל היצרנים
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

  return (
    <ShopLayoutInternal>
      {loading && <div className="text-center py-6">טוען...</div>}

      {!loading && (
        <div>
          <ScrollSearchBar placeholder={`החלק שמאלה או חפש דגם ${vendor}`} containerRef={containerRef} />

          <div
            ref={containerRef}
            className="scroll-container flex overflow-x-scroll space-x-4 pb-4 px-2 snap-x snap-mandatory scroll-smooth"
          >
            {models.map((m) => (
              <Link
                key={m.name}
                href={`/shop/vendor/${vendor}/${m.handle}`}
                data-name={m.name}
                className="min-w-[160px] flex-shrink-0 border rounded-lg p-4 shadow hover:shadow-lg transition snap-start bg-white"
              >
                {m.image && (
                  <div className="relative w-full h-24 mb-2">
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
                <p className="text-center font-semibold text-gray-900 hover:text-[#e60000] transition-colors duration-200">
                  {m.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </ShopLayoutInternal>
  );
}
