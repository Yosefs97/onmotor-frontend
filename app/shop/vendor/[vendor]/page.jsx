// /app/shop/vendor/[vendor]/page.jsx
import VendorPageInner from './VendorPageInner';
import { fetchVendorModels } from '@/lib/shop/fetchVendorModels';
// 👇 הוספנו את הייבוא של שליפת המוצרים
import { fetchHomepageProducts } from '@/lib/shop/fetchHomepageProducts';

export const revalidate = 600;

export default async function VendorPage({ params, searchParams }) {
  // תיקון חובה ל-Next.js 15: המתנה (await) לנתונים
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // שימוש במשתנים שחולצו (resolved)
  const vendor = resolvedSearchParams.vendor || resolvedParams.vendor;

  // הופכים את searchParams לאובייקט אמיתי (שימוש בגרסה המוכנה)
  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );

  // 📌 מביאים את הדגמים ואת המוצרים ביחד (באופן מקבילי לביצועים טובים יותר)
  const [models, products] = await Promise.all([
    fetchVendorModels({ vendor, filters }),
    fetchHomepageProducts() // 👈 השליפה החדשה שהוספנו
  ]);

  return (
    <VendorPageInner
      vendor={vendor}
      models={models}
      products={products} // 👈 מעבירים את המוצרים פנימה כדי שיסוננו לפי יצרן
    />
  );
}