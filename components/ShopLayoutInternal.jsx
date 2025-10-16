'use client';
import { Suspense } from 'react';
import ShopSidebar from '@/components/ShopSidebar';
import MobileShopFilterBar from '@/components/MobileShopFilterBar';
import AutoShopBreadcrumbs from '@/components/AutoShopBreadcrumbs';
import ShopInfoAccordion from '@/components/ShopInfoAccordion';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { buildUrlFromFilters } from '@/utils/buildUrlFromFilters';

function ShopLayoutInternalContent({ children, product = null }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = Object.fromEntries(searchParams.entries());

  const handleSearch = (newFilters) => {
    const url = buildUrlFromFilters(newFilters, pathname, product);
    router.push(url, { scroll: false });
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-4 gap-6" dir="rtl">
      <div className="hidden md:block">
        <ShopSidebar onFilterChange={handleSearch} product={product} />
      </div>

      <div className="md:col-span-3 space-y-6">
        <AutoShopBreadcrumbs filters={filters} product={product} />

        <div className="md:hidden">
          <MobileShopFilterBar onFilterChange={handleSearch} product={product} />
        </div>

        {children}

        <ShopInfoAccordion />
      </div>
    </div>
  );
}

export default function ShopLayoutInternal(props) {
  return (
    <Suspense fallback={<div className="text-center py-6">טוען רכיבי חנות...</div>}>
      <ShopLayoutInternalContent {...props} />
    </Suspense>
  );
}
