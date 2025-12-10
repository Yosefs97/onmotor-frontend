// /app/shop/vendor/[vendor]/[model]/page.jsx
import ModelPageInner from './ModelPageInner';
import { fetchShopifyModel } from '@/lib/shop/fetchShopifyModel';

export const revalidate = 600;

export default async function ModelPage({ params, searchParams }) {
  // 👇👇👇 תיקון חובה ל-Next.js 15: המתנה (await) לנתונים
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // שימוש במשתנים שחולצו (resolved)
  const vendor = resolvedSearchParams.vendor || resolvedParams.vendor;
  const model = resolvedSearchParams.model || resolvedParams.model;

  // 🔥 הופכים searchParams לאובייקט רגיל
  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );

  // 📌 מביאים נתונים מהשרת
  const items = await fetchShopifyModel({ vendor, model, filters });

  return (
    <ModelPageInner
      items={items}
      vendor={vendor}
      model={model}
    />
  );
}