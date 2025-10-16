'use client';

import { useState, useEffect, useRef } from 'react';

export default function ZoomWrapper({ children }) {
  const [zoom, setZoom] = useState(1.0);
  const wrapperRef = useRef(null);

  // שינוי קנה מידה בפועל
  useEffect(() => {
  const isMobile = window.innerWidth < 1024;
  if (wrapperRef.current) {
    wrapperRef.current.style.transform = isMobile ? 'none' : `scale(${zoom})`;
    wrapperRef.current.style.transformOrigin = 'top center';
  }
}, [zoom]);


  // פעולות זום
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const resetZoom = () => setZoom(1.0);

  return (
    <div className="relative w-full">
      {/* 🔘 כפתורי זום – בצד שמאל, מוסתרים במובייל */}
      <div className="opacity-70 fixed top-[100px] left-0 z-50 flex flex-col gap-2 bg-white border p-1 rounded shadow-lg hidden lg:flex">
        <span className="text-xs text-center font-bold">זום</span>
        <button onClick={zoomOut} className="bg-gray-200 hover:bg-gray-300 p-1 rounded">−</button>
        <button onClick={resetZoom} className="bg-blue-500 hover:bg-gray-300 p-1 rounded text-sm">איפוס</button>
        <span className="text-xs text-center">{Math.round(zoom * 100)}%</span>
      </div>

      {/* קונטיינר בזום */}
      <div ref={wrapperRef} style={{ transition: 'zoom-wrapper lg:scale-[0.97]' }}>
        {children}
      </div>
    </div>
  );
}
