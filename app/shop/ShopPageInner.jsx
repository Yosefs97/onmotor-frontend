// app\shop\ShopPageInner.jsx
'use client';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';

export default function ShopHome() {
  return (
    <ShopLayoutInternal>
      <div className="w-full px-2 md:px-4 mt-4">
        <ManufacturerGrid />
      </div>
    </ShopLayoutInternal>
  );
}
