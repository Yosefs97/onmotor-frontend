'use client';
import { Suspense } from 'react';
import ProductFetcherInner from './ProductFetcherInner';

export default function ProductFetcher(props) {
  return (
    <Suspense fallback={<div className="text-center py-6">טוען מוצרים...</div>}>
      <ProductFetcherInner {...props} />
    </Suspense>
  );
}
