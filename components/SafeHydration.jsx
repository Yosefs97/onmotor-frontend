//components\SafeHydration.jsx
'use client';
import { useState, useEffect } from 'react';

export default function SafeHydration({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // עד שהצד של הלקוח לא "עולה" (Mounted), אנחנו לא מרנדרים רכיבים רגישים
  if (!mounted) return <div className="animate-pulse bg-gray-50 h-96 w-full rounded-lg" />;

  return <>{children}</>;
}