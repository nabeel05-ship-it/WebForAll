'use client';

import { Variants, Transition } from 'motion/react';

/**
 * Standard professional easing curves.
 * Smooth deceleration curve that feels responsive and high-end.
 */
export const easeOutCubic: Transition['ease'] = [0.215, 0.61, 0.355, 1];
export const easeSmooth: Transition['ease'] = [0.16, 1, 0.3, 1];

/**
 * Reusable animation variants configured for subtle, professional SaaS motion.
 */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.28, ease: easeOutCubic },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: easeSmooth },
  },
  exit: {
    opacity: 0,
    y: -8,
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

export const scaleRevealVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.26, ease: easeSmooth },
  },
};

/**
 * Interactive button tap & hover micro-motion tokens.
 */
export const buttonInteractive = {
  hover: { scale: 1.015, transition: { duration: 0.15 } },
  tap: { scale: 0.985, transition: { duration: 0.1 } },
};

export const cardInteractive = {
  hover: { y: -2, transition: { duration: 0.2, ease: easeSmooth } },
};

/**
 * Accordion expansion variants for report finding details.
 */
export const accordionVariants: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    overflow: 'hidden',
    transition: { duration: 0.25, ease: easeSmooth },
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.3, ease: easeSmooth },
  },
};
