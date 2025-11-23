// /app/shop/vendor/[vendor]/page.jsx
import VendorPageInner from './VendorPageInner';
import { fetchVendorModels } from '@/lib/shop/fetchVendorModels';

export const revalidate = 600;

export default async function VendorPage({ params, searchParams }) {
  const vendor = searchParams.vendor || params.vendor;

  // 🔥 הופכים את searchParams לאובייקט אמיתי
  const filters = Object.fromEntries(
    Object.entries(searchParams || {}).map(([k, v]) => [k, String(v)])
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
