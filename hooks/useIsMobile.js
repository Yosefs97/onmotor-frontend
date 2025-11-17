//hooks\useIsMobile.js
'use client';
import { useEffect, useState } from 'react';

export default function useIsMobile(breakpoint = 1225) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}