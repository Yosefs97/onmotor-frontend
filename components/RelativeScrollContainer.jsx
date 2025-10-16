// components/RelativeScrollContainer.jsx
'use client';
import { useEffect, useRef } from 'react';

export default function RelativeScrollContainer({ children }) {
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollRatio =
        container.scrollTop / (container.scrollHeight - container.clientHeight);

      sectionsRef.current.forEach((section) => {
        if (section && section.scrollHeight > section.clientHeight) {
          section.scrollTop =
            scrollRatio * (section.scrollHeight - section.clientHeight);
        }
      });
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // children מקבלים ref כדי לאפשר שליטה פנימית
  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll flex flex-col lg:flex-row bg-[#1a1a1a]"
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              ref={(el) => (sectionsRef.current[i] = el)}
              className="overflow-y-scroll flex-1 min-h-screen"
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
