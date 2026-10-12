import React from 'react';
import Image from 'next/image';

export interface BrandLogoProps {
  /** Variant for backwards compatibility: 'icon' hides wordmark, 'full'/'responsive' shows wordmark */
  variant?: 'full' | 'icon' | 'responsive';
  /** Whether to prioritize loading the image (e.g. in the sticky header) */
  priority?: boolean;
  /** Additional container styling */
  className?: string;
  /** Icon size in pixels (default: 36) */
  iconSize?: number;
  /** Full height prop for backwards compatibility */
  fullHeight?: number;
  /** Explicit styling override for the wordmark text */
  textClassName?: string;
  /** Whether to show the readable wordmark beside the icon (default: true) */
  showWordmark?: boolean;
  /** Theme styling for the text: 'light' (dark text for light bg) or 'dark' (white text for dark bg) */
  theme?: 'light' | 'dark';
}

/**
 * BrandLogo
 * 
 * Official brand identity component for WebForAll.
 * Uses the supplied icon-only logo image with separate, readable text:
 * [ ICON-ONLY LOGO ]  WebForAll
 * 
 * Features:
 * - Uses `/brand/webforall-icon.png` as the image asset
 * - Separate, highly readable "WebForAll" text in the project's typography
 * - Perfect vertical alignment and responsive scaling across mobile, tablet, and desktop
 * - Accessibility-conscious: avoids duplicate wordmark announcement when beside text
 */
export default function BrandLogo({
  variant,
  priority = false,
  className = '',
  iconSize = 36,
  fullHeight,
  textClassName = '',
  showWordmark = true,
  theme = 'light',
}: BrandLogoProps) {
  // If iconSize was not explicitly set but fullHeight was provided, adapt iconSize
  const effectiveIconSize = fullHeight ? Math.min(fullHeight, 42) : iconSize;

  const shouldShowWordmark = variant === 'icon' ? false : showWordmark;

  if (!shouldShowWordmark) {
    return (
      <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
        <Image
          src="/brand/webforall-icon.png"
          alt="WebForAll"
          width={effectiveIconSize}
          height={effectiveIconSize}
          priority={priority}
          className="object-contain"
          style={{ width: `${effectiveIconSize}px`, height: `${effectiveIconSize}px` }}
        />
      </div>
    );
  }

  const textColorClass = theme === 'dark' ? 'text-white' : 'text-ink';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 flex-shrink-0 ${className}`}>
      {/* Icon-Only Official Brand Logo Graphic */}
      <div className="relative inline-flex items-center justify-center flex-shrink-0">
        <Image
          src="/brand/webforall-icon.png"
          alt=""
          aria-hidden="true"
          width={effectiveIconSize}
          height={effectiveIconSize}
          priority={priority}
          className="object-contain"
          style={{ width: `${effectiveIconSize}px`, height: `${effectiveIconSize}px` }}
        />
      </div>

      {/* Readable Wordmark Text */}
      <span
        className={`font-extrabold tracking-tight select-none leading-none ${
          textClassName || `text-xl sm:text-[22px] ${textColorClass}`
        }`}
      >
        WebForAll
      </span>
    </div>
  );
}
