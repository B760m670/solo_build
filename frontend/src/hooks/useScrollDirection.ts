import { useState, useEffect, useRef } from 'react';

export function useScrollDirection(threshold = 10) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    // Track scroll events on .scroll-area
    const scrollEl = document.querySelector('.scroll-area');

    const handleScroll = () => {
      if (!scrollEl) return;
      const currentY = scrollEl.scrollTop;
      const diff = currentY - lastY.current;

      if (diff > threshold) setHidden(true);
      else if (diff < -threshold) setHidden(false);

      lastY.current = currentY;
    };

    // Track touch events as fallback (Telegram WebView)
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const diff = touchStartY.current - currentY;

      if (diff > threshold) setHidden(true);
      else if (diff < -threshold) setHidden(false);
    };

    scrollEl?.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      scrollEl?.removeEventListener('scroll', handleScroll);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [threshold]);

  return hidden;
}
