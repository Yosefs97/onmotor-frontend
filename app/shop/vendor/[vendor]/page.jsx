// /app/shop/vendor/[vendor]/page.jsx
import VendorPageInner from './VendorPageInner';
import { fetchVendorModels } from '@/lib/shop/fetchVendorModels';
// 👇 ייבאנו את פונקציית החיפוש שמצאת!
import { fetchSearchResults } from '@/lib/shop/fetchSearch';

export const revalidate = 600;

export default async function VendorPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const vendor = resolvedSearchParams.vendor || resolvedParams.vendor;

  const filters = Object.fromEntries(
    Object.entries(resolvedSearchParams || {}).map(([k, v]) => [k, String(v)])
  );

  // 📌 שולפים את הדגמים, ובמקביל מחפשים מוצרים של היצרן הזה!
  const [models, products] = await Promise.all([
    fetchVendorModels({ vendor, filters }),
    // מעבירים את שם היצרן לפונקציית החיפוש:
    fetchSearchResults({ vendor: vendor }) 
  ]);

  return (
    <VendorPageInner
      vendor={vendor}
      models={models}
      products={products} // עכשיו נעביר את תוצאות החיפוש האמיתיות!
    />
  );
}