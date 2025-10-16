// /components/ProductGallery.jsx
'use client';
import { useState } from 'react';

export default function ProductGallery({ images = [], title }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // אחוזים

  if (!images || images.length === 0) {
    return <p>אין תמונות</p>;
  }

  // חישוב מיקום לפי תנועת עכבר
  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  // מובייל – גרירה עם אצבע
  const handleTouchMove = (e) => {
    if (!zoomed) return;
    const touch = e.touches[0];
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - left) / width) * 100;
    const y = ((touch.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div>
      {/* תמונה ראשית עם zoom + pan */}
      <div
        className={`relative w-full mb-4 overflow-hidden rounded-lg ${
          zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
        }`}
        onClick={() => setZoomed(!zoomed)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <img
          src={images[active].node.url}
          alt={images[active].node.altText || title}
          className={`w-full object-cover transition-transform duration-200 ease-out`}
          style={{
            transform: zoomed
              ? `scale(2) translate(-${position.x - 50}%, -${position.y - 50}%)`
              : 'scale(1) translate(0,0)',
            transformOrigin: `${position.x}% ${position.y}%`,
          }}
        />
      </div>

      {/* thumbnails */}
      <div className="flex gap-2 overflow-x-auto">
        {images.map((edge, i) => (
          <img
            key={i}
            src={edge.node.url}
            alt={edge.node.altText || title}
            onClick={() => {
              setActive(i);
              setZoomed(false);
              setPosition({ x: 50, y: 50 });
            }}
            className={`w-20 h-20 object-cover rounded cursor-pointer border ${
              i === active ? 'border-red-600' : 'border-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
