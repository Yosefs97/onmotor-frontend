// /app/shop/collection/[handle]/page.jsx
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ProductGrid from '@/components/ProductGrid';
import { fetchCollection } from '@/lib/shop/fetchCollection';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs';
import CategorySidebar from '@/components/CategorySidebar';
import Link from 'next/link';

export const revalidate = 600;

export default async function CollectionPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const handle = resolvedParams.handle;
  
  // שליפת הנתונים (עכשיו זה מחזיר גם את dynamicSidebar בתוך collectionData)
  const collectionData = await fetchCollection({ 
    handle, 
    filters: resolvedSearchParams 
  });

  if (!collectionData) {
    return (
      <ShopLayoutInternal>
        <div className="text-center py-20 text-xl font-bold">קטגוריה לא נמצאה</div>
      </ShopLayoutInternal>
    );
  }

  // 👇 עדכון קריטי: העברת הנתונים הדינמיים והנתיב לסרגל החדש
  const sidebarComponent = (
    <CategorySidebar 
      filtersFromAPI={collectionData.filters} 
      dynamicData={collectionData.dynamicSidebar} // הנתונים החדשים מהעץ הדינמי
      basePath={`/shop/collection/${handle}`}     // הנתיב הבסיסי לבניית הקישורים
    />
  );

  return (
    <ShopLayoutInternal hideBreadcrumbs={true} customSidebar={sidebarComponent}>
      
      <div className="px-2 md:px-0 mt-4 mb-6">
        
        <AutoShopBreadcrumbs 
          collection={{ 
            title: collectionData.title, 
            handle: handle 
          }} 
        />
        
        {collectionData.description && (
          <div className="text-gray-600 mb-6 mt-2 text-sm md:text-base">
            {collectionData.description}
          </div>
        )}

        {/* גריד מוצרים */}
        {collectionData.products.length > 0 ? (
            <ProductGrid products={collectionData.products} />
        ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">
                לא נמצאו מוצרים התואמים את הסינון.
            </p>
            <Link href={`/shop/collection/${handle}`} className="text-red-600 mt-2 inline-block hover:underline">
                נקה סינונים
            </Link>
            </div>
        )}
      </div>
      
    </ShopLayoutInternal>
  );
}