

'use client';
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import ModelPageInner from './ModelPageInner';

export default function ModelPage() {
  return (
    <Suspense fallback={<div className="text-center py-6">טוען מוצרים...</div>}>
      <ModelPageInner />
    </Suspense>
  );
}
