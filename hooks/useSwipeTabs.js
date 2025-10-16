// hooks/useSwipeTabs.js
import { useEffect, useRef } from 'react';

export default function useSwipeTabs({ tabs, activeTab, setActiveTab, isMobile }) {
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      touchEndXRef.current = e.changedTouches[0].clientX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const deltaX = touchEndXRef.current - touchStartXRef.current;
      const threshold = 50;

      const currentIndex = tabs.indexOf(activeTab);
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && currentIndex > 0) {
          setActiveTab(tabs[currentIndex - 1]);
        } else if (deltaX < 0 && currentIndex < tabs.length - 1) {
          setActiveTab(tabs[currentIndex + 1]);
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeTab, isMobile, tabs, setActiveTab]);

  return containerRef;
}
