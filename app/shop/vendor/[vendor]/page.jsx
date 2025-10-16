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

  useEffect(() => {
    const fetchVendorModels = async () => {
      setLoading(true);

      // ⚡️ לנקות פרמטרים לא תקינים (כמו yearFrom=0, yearTo=0)
      const cleanFilters = { ...filters };
      if (cleanFilters.year === '0' || cleanFilters.year === 0) {
        delete cleanFilters.year;
      }
      if (cleanFilters.yearFrom === '0' || cleanFilters.yearFrom === 0) {
        delete cleanFilters.yearFrom;
      }
      if (cleanFilters.yearTo === '0' || cleanFilters.yearTo === 0) {
        delete cleanFilters.yearTo;
      }

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

      // ✅ מיון אלפביתי
      modelsArray.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

      setModels(modelsArray);
      setLoading(false);
    };

    fetchVendorModels();
  }, [vendor, JSON.stringify(filters)]);

  return (
    <ShopLayoutInternal>
      {loading && <div className="text-center py-6">טוען...</div>}
      {!loading && (
        <div>
          <ScrollSearchBar placeholder={`חפש דגם ${vendor}`} containerRef={containerRef} />

          <div
            ref={containerRef}
            className="flex overflow-x-auto space-x-4 pb-4 px-2 snap-x snap-mandatory"
          >
            {models.map((m) => (
              <Link
                key={m.name}
                href={`/shop/vendor/${vendor}/${m.handle}`}
                data-name={m.name}
                className="min-w-[160px] flex-shrink-0 border rounded-lg p-4 shadow hover:shadow-lg transition snap-start"
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
                <p className="text-center font-semibold">{m.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </ShopLayoutInternal>
  );
}
