// /app/shop/vendor/[vendor]/[model]/page.jsx
import ModelPageInner from './ModelPageInner';
import { fetchShopifyModel } from '@/lib/shop/fetchShopifyModel';

export const revalidate = 600; // 10 דקות קאש — מצוין למוצרים

export default async function ModelPage({ params, searchParams }) {
  const vendor = searchParams.vendor || params.vendor;
  const model = searchParams.model || params.model;

  // מביא נתונים בשרת (לא בלקוח)
  const items = await fetchShopifyModel({ vendor, model, filters: searchParams });

  return (
    <ModelPageInner
      items={items}
      vendor={vendor}
      model={model}
    />
  );
}
