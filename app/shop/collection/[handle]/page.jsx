// /app/shop/collection/[handle]/page.jsx
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import { fetchCollection } from '@/lib/shop/fetchCollection';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs';
import Link from 'next/link';

export const revalidate = 600;

export default async function CollectionPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const handle = resolvedParams.handle;
  const selectedVendor = resolvedSearchParams.vendor; 

  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );

  const collectionData = await fetchCollection({ handle, filters });

  if (!collectionData) {
    return (
      <ShopLayoutInternal>
        <div className="text-center py-20 text-xl font-bold">קטגוריה לא נמצאה</div>
      </ShopLayoutInternal>
    );
  }

  const allVendors = [...new Set(collectionData.products.map(p => p.vendor))].filter(Boolean).sort();
  const displayedProducts = selectedVendor
    ? collectionData.products.filter(p => p.vendor === selectedVendor)
    : collectionData.products;

  return (
    <ShopLayoutInternal>
      <div className="px-2 md:px-4 mt-4 mb-6">
        
        {/* 👇 הרכיב הזה כבר מציג את הכותרת בעברית (collectionData.title) */}
        <AutoShopBreadcrumbs 
          collection={{ 
            title: collectionData.title, // כאן נכנסת הכותרת בעברית ("קסדות")
            handle: handle 
          }} 
        />
        
        {/* ❌ מחקתי מכאן את ה-h1 שהיה יוצר כפילות */}

        {collectionData.description && (
          <div className="text-gray-600 mb-6 mt-2 text-sm md:text-base">
            {collectionData.description}
          </div>
        )}

        {allVendors.length > 1 && (
          <div className="mb-8 mt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">סנן לפי יצרן:</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/shop/collection/${handle}`}
                className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-all border ${
                  !selectedVendor 
                    ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-600 hover:text-red-600'
                }`}
              >
                הכל
              </Link>
              {allVendors.map(vendor => (
                <Link
                  key={vendor}
                  href={`/shop/collection/${handle}?vendor=${encodeURIComponent(vendor)}`}
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-all border ${
                    selectedVendor === vendor
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-red-600 hover:text-red-600'
                  }`}
                >
                  {vendor}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {displayedProducts.length > 0 ? (
        <ProductGrid products={displayedProducts} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg mx-2">
          <p className="text-gray-500 text-lg">
            לא נמצאו מוצרים של <span className="font-bold">{selectedVendor}</span> בקטגוריה זו.
          </p>
          <Link href={`/shop/collection/${handle}`} className="text-red-600 mt-2 inline-block hover:underline">
            חזור להציג הכל
          </Link>
        </div>
      )}
      
    </ShopLayoutInternal>
  );
}