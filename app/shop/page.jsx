// /app/shop/page.jsx
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';
import { fetchManufacturers } from '@/lib/shop/fetchManufacturers';

export const revalidate = 600; // 10 דקות ISR

export default async function ShopPage() {
  const manufacturers = await fetchManufacturers();

  return (
    <ShopLayoutInternal>
      <div className="w-full px-2 md:px-4 mt-4">
        {/* 👇 מעבירים נתונים מוכנים מהשרת */}
        <ManufacturerGrid manufacturers={manufacturers} />
      </div>
    </ShopLayoutInternal>
  );
}
