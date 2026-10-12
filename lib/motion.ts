'use client';

import { Variants, Transition } from 'motion/react';

/**
 * Standard professional easing curves.
 * Smooth deceleration curves tailored for developer-tool interfaces.
 */
export const easeOutCubic: Transition['ease'] = [0.215, 0.61, 0.355, 1];
export const easeSmooth: Transition['ease'] = [0.16, 1, 0.3, 1];
export const easeSpring: Transition['ease'] = [0.34, 1.56, 0.64, 1];
export const easeInOutCubic: Transition['ease'] = [0.65, 0, 0.35, 1];

/**
 * Reusable animation variants configured for subtle, professional motion.
 * Respects natural timing and prevents layout thrashing.
 */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.28, ease: easeOutCubic },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeSmooth },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, ease: easeSmooth },
  },
  exit: {
    opacity: 0,
    x: -12,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const containerStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const containerStaggerFastVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.01,
    },
  },
};

export const scaleRevealVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.28, ease: easeSmooth },
  },
};

/**
 * Interactive button tap & hover micro-motion tokens.
 */
export const buttonInteractive = {
  hover: { scale: 1.015, y: -1, transition: { duration: 0.15, ease: easeSmooth } },
  tap: { scale: 0.985, y: 0, transition: { duration: 0.1 } },
};

export const iconInteractive = {
  hover: { scale: 1.08, rotate: 2, transition: { duration: 0.15 } },
  tap: { scale: 0.95 },
};

export const cardInteractive = {
  hover: { y: -3, transition: { duration: 0.2, ease: easeSmooth } },
};

export const cardHoverVariants: Variants = {
  rest: { y: 0, transition: { duration: 0.2, ease: easeSmooth } },
  hover: { y: -3, transition: { duration: 0.2, ease: easeSmooth } },
};

export const cardTapVariants = {
  tap: { scale: 0.99, y: -1 },
};

/**
 * Accordion expansion variants for report finding details.
 */
export const accordionVariants: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    overflow: 'hidden',
    transition: { duration: 0.24, ease: easeSmooth },
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.32, ease: easeSmooth },
  },
};

/**
 * Pulse indicator for live scan status
 */
export const livePulseVariants: Variants = {
  pulse: {
    scale: [1, 1.08, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Spring configurations for layout pills, active tabs, and navigation
 */
export const springPill = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 32,
};

export const springDrawer = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 28,
};

/**
 * Metric card count reveal variants
 */
export const metricCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.32, ease: easeSmooth },
  },
};
