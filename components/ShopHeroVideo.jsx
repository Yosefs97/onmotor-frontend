'use client';

import { useEffect, useState } from 'react';

const poster = '/videos/onmotor-riders-hero-poster.png';
const video = '/videos/onmotor-riders-hero-ai.webm';

export default function ShopHeroVideo() {
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setCanAnimate(!reducedMotion.matches);

    updatePreference();
    reducedMotion.addEventListener('change', updatePreference);
    return () => reducedMotion.removeEventListener('change', updatePreference);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {canAnimate && (
        <video className="absolute inset-0 h-full w-full object-cover" autoPlay loop muted playsInline preload="metadata" poster={poster}>
          <source src={video} type="video/webm" />
        </video>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(230,0,0,0.56),transparent_29%),linear-gradient(90deg,rgba(9,9,11,0.25)_0%,rgba(9,9,11,0.6)_43%,rgba(9,9,11,0.96)_100%)]" />
    </div>
  );
}
