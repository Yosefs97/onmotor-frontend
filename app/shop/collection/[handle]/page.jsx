// /app/shop/collection/[handle]/page.jsx
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import { fetchCollection } from '@/lib/shop/fetchCollection';
import Link from 'next/link';

export const revalidate = 600;

export default async function CollectionPage({ params, searchParams }) {
  // תיקון ל-Next.js 15
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const handle = resolvedParams.handle;
  const selectedVendor = resolvedSearchParams.vendor; // האם נבחר יצרן?

  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );

  // 1. שליפת הנתונים מהשרת
  const collectionData = await fetchCollection({ handle, filters });

  if (!collectionData) {
    return (
      <ShopLayoutInternal>
        <div className="text-center py-20 text-xl font-bold">קטגוריה לא נמצאה</div>
      </ShopLayoutInternal>
    );
  }

  // 2. יצירת רשימת יצרנים נקייה מתוך המוצרים שנמצאו
  // Set מבטיח שכל יצרן יופיע רק פעם אחת
  const allVendors = [...new Set(collectionData.products.map(p => p.vendor))].filter(Boolean).sort();

  // 3. סינון המוצרים להצגה (אם נבחר יצרן ספציפי)
  const displayedProducts = selectedVendor
    ? collectionData.products.filter(p => p.vendor === selectedVendor)
    : collectionData.products;

  return (
    <ShopLayoutInternal>
      <div className="mb-6 px-2">
        {/* כותרת ראשית */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-8 bg-red-600 rounded-full" />
          <h1 className="text-3xl font-bold text-gray-900">
            {collectionData.title}
          </h1>
        </div>
        
        {collectionData.description && (
          <div className="text-gray-600 mb-6">{collectionData.description}</div>
        )}

        {/* 🔥 סרגל מותגים - יופיע רק אם יש יותר ממותג אחד בקטגוריה */}
        {allVendors.length > 1 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">סנן לפי יצרן:</h3>
            <div className="flex flex-wrap gap-2">
              
              {/* כפתור "הכל" */}
              <Link
                href={`/shop/collection/${handle}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  !selectedVendor 
                    ? 'bg-red-600 text-white border-red-600 shadow-md' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-600 hover:text-red-600'
                }`}
              >
                הכל
              </Link>

              {/* כפתורים לכל יצרן */}
              {allVendors.map(vendor => (
                <Link
                  key={vendor}
                  href={`/shop/collection/${handle}?vendor=${encodeURIComponent(vendor)}`}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    selectedVendor === vendor
                      ? 'bg-red-600 text-white border-red-600 shadow-md'
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

      {/* רכיב הגריד הקיים שלך - ללא שינוי */}
      {displayedProducts.length > 0 ? (
        <ProductGrid products={displayedProducts} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
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