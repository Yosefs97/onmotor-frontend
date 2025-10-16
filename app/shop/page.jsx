
'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import ShopLayoutInternal from '@/components/ShopLayoutInternal';
import ManufacturerGrid from '@/components/ManufacturerGrid';

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="text-center py-6">טוען חנות...</div>}>
      <ShopLayoutInternal>
        <Suspense fallback={<div className="text-center py-4">טוען קטגוריות...</div>}>
          <div className="w-full px-2 md:px-4 mt-4">
            <ManufacturerGrid />
          </div>
        </Suspense>
      </ShopLayoutInternal>
    </Suspense>
  );
}
