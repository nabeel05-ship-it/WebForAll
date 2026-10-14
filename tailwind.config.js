/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // "Bright Signals" Design System Palette
        // Every DEFAULT used as text meets WCAG AA (4.5:1) on surface, canvas and its own -soft tint.
        canvas: {
          DEFAULT: '#F6F5FB', // Soft neutral-lavender canvas background
          lavender: '#F2F0FF',
        },
        cream: {
          DEFAULT: '#FFF8EA', // Warm cream alternate surface
          soft: '#FFFDF7',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8F7FD',
        },
        ink: {
          DEFAULT: '#0F1729', // Deep ink primary text & headings
          primary: '#0F1729',
          muted: '#58677D',   // Supporting text (5.7:1 on white)
          subtle: '#687588',  // Tertiary text (4.7:1 on white)
        },
        electric: {
          DEFAULT: '#3157E8', // Electric blue primary CTA & key links
          hover: '#2244C9',
          soft: '#E6ECFF',
        },
        coral: {
          DEFAULT: '#B5321F', // Critical accent, AA-safe as text
          hover: '#962817',
          bright: '#F25C4D',  // Decorative fills only
          soft: '#FFE9E5',
        },
        golden: {
          DEFAULT: '#F5B92E', // Golden yellow fills, borders & icons on dark (never small text on light)
          hover: '#DE9E16',
          ink: '#865400',     // AA-safe golden text
          soft: '#FFF3D6',
        },
        teal: {
          DEFAULT: '#0B7064', // Success/pass accent, AA-safe as text
          hover: '#095A50',
          bright: '#19A89A',  // Decorative fills only
          soft: '#E0F5F1',
        },
        violet: {
          DEFAULT: '#6B46D9', // Deep violet secondary brand accent
          hover: '#5733C2',
          soft: '#F1EDFF',
        },
        border: {
          DEFAULT: '#D8DDE7',
          ink: '#D8DDE7',
          subtle: '#E8EBF1',
          strong: '#B4BDCC',
          input: '#7B8698', // 3.4:1 on white for form-control boundaries (WCAG 1.4.11)
        },
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Manrope',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'var(--font-display)',
          'var(--font-sans)',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      scale: {
        102: '1.02',
      },
      ringWidth: {
        3: '3px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(15, 23, 41, 0.04), 0 1px 3px 0 rgba(15, 23, 41, 0.04)',
        card: '0 1px 2px rgba(15, 23, 41, 0.04), 0 4px 12px -2px rgba(15, 23, 41, 0.06), 0 12px 32px -8px rgba(15, 23, 41, 0.06)',
        elevated: '0 2px 4px rgba(15, 23, 41, 0.04), 0 12px 24px -6px rgba(15, 23, 41, 0.10), 0 32px 64px -16px rgba(15, 23, 41, 0.14)',
        highlight: '0 0 0 3px rgba(49, 87, 232, 0.25)',
        coralGlow: '0 8px 24px -4px rgba(181, 50, 31, 0.25)',
        electricGlow: '0 1px 0 0 rgba(255, 255, 255, 0.18) inset, 0 8px 24px -6px rgba(49, 87, 232, 0.55)',
        glass: '0 1px 0 0 rgba(255, 255, 255, 0.7) inset, 0 1px 3px rgba(15, 23, 41, 0.05)',
      },
    },
  },
  plugins: [],
};
