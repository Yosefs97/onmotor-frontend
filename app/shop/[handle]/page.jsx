//app\shop\[handle]\page.jsx
export const dynamic = 'force-dynamic';

'use client';
import { Suspense } from 'react';
import ProductPageInner from './ProductPageInner';

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="text-center py-6">טוען מוצר...</div>}>
      <ProductPageInner />
    </Suspense>
  );
}
