export const dynamic = 'force-dynamic';

'use client';
import { Suspense } from 'react';
import VendorPageInner from './VendorPageInner';

export default function VendorPage() {
  return (
    <Suspense fallback={<div className="text-center py-6">טוען דגמים...</div>}>
      <VendorPageInner />
    </Suspense>
  );
}
