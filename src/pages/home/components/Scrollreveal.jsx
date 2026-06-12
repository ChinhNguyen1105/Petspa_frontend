// components/common/ScrollReveal.jsx
import React from 'react';
import { useScrollReveal } from './Usescrollreveal';

/**
 * <ScrollReveal> — Bọc bất kỳ section nào để có animation khi scroll đến.
 *
 * Props:
 *  variant  — kiểu animation:
 *    'fade-up'      (default) trượt lên + fade in
 *    'fade-down'    trượt xuống + fade in
 *    'fade-left'    trượt từ trái + fade in
 *    'fade-right'   trượt từ phải + fade in
 *    'zoom-in'      phóng to từ nhỏ + fade in
 *    'flip-up'      lật ngược từ dưới (3D)
 *    'slide-reveal' wipe reveal từ trái sang phải
 *
 *  delay     — ms trì hoãn (dùng cho stagger). Default: 0
 *  duration  — ms duration. Default: 700
 *  className — class thêm vào wrapper
 *  threshold — % element hiển thị mới trigger. Default: 0.15
 */

const VARIANTS = {
  'fade-up': {
    hidden: 'opacity-0 translate-y-16',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    hidden: 'opacity-0 -translate-y-16',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    hidden: 'opacity-0 translate-x-16',
    visible: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    hidden: 'opacity-0 -translate-x-16',
    visible: 'opacity-100 translate-x-0',
  },
  'zoom-in': {
    hidden: 'opacity-0 scale-90',
    visible: 'opacity-100 scale-100',
  },
  'flip-up': {
    // dùng style inline vì Tailwind không có perspective
    useStyle: true,
  },
  'slide-reveal': {
    useStyle: true,
  },
};

export default function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 700,
  className = '',
  threshold = 0.15,
  once = true,
}) {
  const [ref, isVisible] = useScrollReveal({ threshold, once });
  const config = VARIANTS[variant] || VARIANTS['fade-up'];

  /* ── Tailwind-based variants ── */
  if (!config.useStyle) {
    return (
      <div
        ref={ref}
        className={`
          transition-all ease-out will-change-transform
          ${isVisible ? config.visible : config.hidden}
          ${className}
        `}
        style={{
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
        }}
      >
        {children}
      </div>
    );
  }

  /* ── flip-up (inline style, 3D) ── */
  if (variant === 'flip-up') {
    return (
      <div
        ref={ref}
        style={{
          perspective: '1000px',
          transitionDelay: `${delay}ms`,
        }}
        className={className}
      >
        <div
          style={{
            transition: `transform ${duration}ms cubic-bezier(0.16,1,0.3,1), opacity ${duration}ms ease`,
            transitionDelay: `${delay}ms`,
            transform: isVisible ? 'rotateX(0deg) translateY(0px)' : 'rotateX(-30deg) translateY(60px)',
            opacity: isVisible ? 1 : 0,
            transformOrigin: 'top center',
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  /* ── slide-reveal (clip-path wipe) ── */
  if (variant === 'slide-reveal') {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          clipPath: isVisible ? 'inset(0% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)',
          transition: `clip-path ${duration}ms cubic-bezier(0.77,0,0.18,1)`,
          transitionDelay: `${delay}ms`,
        }}
      >
        {children}
      </div>
    );
  }

  return <div ref={ref} className={className}>{children}</div>;
}