import { useState, useEffect, useRef } from 'react';

export function useScrollDirection(threshold = 10) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const scrollEl = document.querySelector('.scroll-area');
    if (!scrollEl) return;

    const handleScroll = () => {
      const currentY = scrollEl.scrollTop;
      const diff = currentY - lastScrollY.current;

      if (diff > threshold) {
        setHidden(true);
      } else if (diff < -threshold) {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return hidden;
}
