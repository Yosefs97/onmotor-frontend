// /app/shop/vendor/[vendor]/page.jsx
import VendorPageInner from './VendorPageInner';
import { fetchVendorModels } from '@/lib/shop/fetchVendorModels';
import { fetchSearchResults } from '@/lib/shop/fetchSearch';

export const revalidate = 600;

export default async function VendorPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const vendor = resolvedSearchParams.vendor || resolvedParams.vendor;

  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );

  // 🛡️ רשת ביטחון: אם בקשה אחת נכשלת, היא תחזיר מערך ריק במקום להפיל את כל העמוד
  const [models, products] = await Promise.all([
    fetchVendorModels({ vendor, filters }).catch(() => []),
    fetchSearchResults({ vendor: vendor }).catch((err) => {
      console.error(`Failed to fetch products for vendor ${vendor}:`, err);
      return []; 
    }) 
  ]);

  return (
    <VendorPageInner
      vendor={vendor}
      models={models}
      products={products}
    />
  );
}