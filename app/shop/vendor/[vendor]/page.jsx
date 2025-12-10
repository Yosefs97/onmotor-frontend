// /app/shop/vendor/[vendor]/page.jsx
import VendorPageInner from './VendorPageInner';
import { fetchVendorModels } from '@/lib/shop/fetchVendorModels';

export const revalidate = 600;

export default async function VendorPage({ params, searchParams }) {
  // 👇👇👇 תיקון חובה ל-Next.js 15: המתנה (await) לנתונים
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // שימוש במשתנים שחולצו (resolved)
  const vendor = resolvedSearchParams.vendor || resolvedParams.vendor;

  // 🔥 הופכים את searchParams לאובייקט אמיתי (שימוש בגרסה המוכנה)
  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );

  // 📌 מביא את הדגמים מהשרת
  const models = await fetchVendorModels({ vendor, filters });

  return (
    <VendorPageInner
      vendor={vendor}
      models={models}
    />
  );
}