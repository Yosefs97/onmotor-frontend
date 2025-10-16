'use client';
import { Suspense } from 'react';
import ShopPageInner from './ShopPageInner';

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="text-center py-6">טוען חנות...</div>}>
      <ShopPageInner />
    </Suspense>
  );
}
