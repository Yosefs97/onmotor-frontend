// /app/shop/vendor/[vendor]/page.jsx
import VendorPageInner from './VendorPageInner';
import { fetchVendorModels } from '@/lib/shop/fetchVendorModels';

export const revalidate = 600; // קאש של 10 דקות — יציב ומהיר

export default async function VendorPage({ params, searchParams }) {
  const vendor = searchParams.vendor || params.vendor;

  // 📌 מביא את הדגמים מהשרת (לא מהדפדפן!)
  const models = await fetchVendorModels({ vendor, filters: searchParams });

  return (
    <VendorPageInner
      vendor={vendor}
      models={models}   // ← מעבירים נתון מוכן
    />
  );
}
