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
    <div className="border-t border-gray-200 pt-0 pb-0 mt-0">
      <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
        נותני שירות שבחרנו לפרסם (ללא עלות)
      </h2>
      {/* טקסט ההבהרה */}
      <p className="text-s text-gray-500 text-center max-w-2xl mx-auto px-2 leading-tight">
        הבהרה: העסקים המופיעים כאן נבחרו על ידינו וללא תמורה כספית. 
        אין בפרסום זה משום המלצה, והאתר אינו נושא באחריות לטיב השירות או לתוצאותיו.
      </p>
      
      {lawyers.length > 0 && <AdCarousel title="עורכי דין מהתחום" items={lawyers} />}
      {insurance.length > 0 && <AdCarousel title="סוכני ביטוח מהקהילה" items={insurance} />}
      {proSchools.length > 0 && <AdCarousel title="בתי ספר לרכיבה מקצועית" items={proSchools} />}
      {drivingSchools.length > 0 && <AdCarousel title="בתי ספר לנהיגה" items={drivingSchools} />}
    </div>
  );
}