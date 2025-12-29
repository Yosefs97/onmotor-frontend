// components/ServiceProvidersSection.jsx
import React from 'react';
import AdCarousel from '@/components/AdCarousel';
import { getLawAds } from '@/lib/getAds';

export default async function ServiceProvidersSection() {
  const ads = await getLawAds();

  if (!ads || ads.length === 0) return null;

  const lawyers = ads.filter(ad => ad.category === 'lawyer');
  const insurance = ads.filter(ad => ad.category === 'insurance');
  const proSchools = ads.filter(ad => ad.category === 'pro_riding');
  const drivingSchools = ads.filter(ad => ad.category === 'driving_school');

  return (
    <div className="border-t border-gray-200 pt-1 pb-1 mt-4">
      <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
        נותני שירות מומלצים
      </h2>
      
      {lawyers.length > 0 && <AdCarousel title="עורכי דין מהתחום" items={lawyers} />}
      {insurance.length > 0 && <AdCarousel title="סוכני ביטוח מהקהילה" items={insurance} />}
      {proSchools.length > 0 && <AdCarousel title="בתי ספר לרכיבה מקצועית" items={proSchools} />}
      {drivingSchools.length > 0 && <AdCarousel title="בתי ספר לנהיגה" items={drivingSchools} />}
    </div>
  );
}