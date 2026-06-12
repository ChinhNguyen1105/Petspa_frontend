// hooks/useScrollReveal.js
import { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal
 * Trả về [ref, isVisible] — gắn ref vào element muốn animate.
 * @param {Object} options
 * @param {number} options.threshold   - % element hiển thị mới trigger (0–1). Default: 0.15
 * @param {string} options.rootMargin  - margin trước khi trigger. Default: '0px 0px -60px 0px'
 * @param {boolean} options.once       - Chỉ animate 1 lần. Default: true
 */
export function useScrollReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  once = true,
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, isVisible];
}