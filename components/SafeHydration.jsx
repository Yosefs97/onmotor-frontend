// components/SafeHydration.jsx
'use client';
import { useState, useEffect } from 'react';

export default function SafeHydration({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // עד שהלקוח לא מוכן, לא מרנדרים את הרכיבים הבעייתיים
  if (!mounted) return null;

  return <>{children}</>;
}