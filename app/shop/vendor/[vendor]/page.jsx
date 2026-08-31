// /app/shop/vendor/[vendor]/page.jsx
import VendorPageInner from './VendorPageInner';
import { fetchVendorModels } from '@/lib/shop/fetchVendorModels';

// 👇 1. נשנה את הייבוא לפונקציה ששולפת מוצרים כלליים מהחנות (התאם את הנתיב והשם למה שיש אצלך בפרויקט)
import { fetchProducts } from '@/lib/shopify/fetchProducts'; 

export const revalidate = 600;

export default async function VendorPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const vendor = resolvedSearchParams.vendor || resolvedParams.vendor;

  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );

  // 📌 2. כאן השינוי הגדול: אנחנו מבקשים ספציפית מוצרים של היצרן הזה!
  const [models, products] = await Promise.all([
    fetchVendorModels({ vendor, filters }),
    // מעבירים את שם היצרן לפונקציה כדי שתביא מהשרת רק מוצרים שלו
    fetchProducts({ query: `vendor:${vendor}`, limit: 12 }) 
  ]);

  return (
    <VendorPageInner
      vendor={vendor}
      models={models}
      products={products} // עכשיו זה מכיל 100% מוצרים של היצרן הזה!
    />
  );
}