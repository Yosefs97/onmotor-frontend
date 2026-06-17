// /app/shop/vendor/[vendor]/[model]/page.jsx
import ModelPageInner from './ModelPageInner';
import { fetchShopifyModel } from '@/lib/shop/fetchShopifyModel';

export const revalidate = 600;

export default async function ModelPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const vendor = resolvedSearchParams.vendor || resolvedParams.vendor;
  const rawModel = resolvedSearchParams.model || resolvedParams.model;

  // 🔥 התיקון: הפיכת המקף מה-URL לרווח (למשל "ec-300" הופך ל-"ec 300")
  const cleanModel = rawModel ? rawModel.replace(/-/g, ' ') : '';

  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );

  // 📌 שליחת הדגם הנקי (עם רווחים) למנוע החיפוש
  const items = await fetchShopifyModel({ vendor, model: cleanModel, filters });

  return (
    <ModelPageInner
      items={items}
      vendor={vendor}
      model={cleanModel} // מעבירים את הדגם הנקי גם לקליינט לתצוגה יפה
    />
  );
}