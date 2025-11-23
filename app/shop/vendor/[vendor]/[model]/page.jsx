// /app/shop/vendor/[vendor]/[model]/page.jsx
import ModelPageInner from './ModelPageInner';
import { fetchShopifyModel } from '@/lib/shop/fetchShopifyModel';

export const revalidate = 600;

export default async function ModelPage({ params, searchParams }) {
  const vendor = searchParams.vendor || params.vendor;
  const model = searchParams.model || params.model;

  // 🔥 הופכים searchParams לאובייקט רגיל
  const filters = Object.fromEntries(
    Object.entries(searchParams || {}).map(([k, v]) => [k, String(v)])
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
