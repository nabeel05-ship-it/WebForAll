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
        canvas: {
          DEFAULT: '#F2F0FF', // Lavender canvas background
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
          DEFAULT: '#18233A', // Deep ink primary text & headings
          primary: '#18233A',
          muted: '#58677D',   // Supporting text
          subtle: '#8C97A4',
        },
        electric: {
          DEFAULT: '#3157E8', // Electric blue primary CTA & key links
          hover: '#2244C9',
          soft: '#E3EAFF',
        },
        coral: {
          DEFAULT: '#F25C4D', // Vivid coral critical/energy accent
          hover: '#DB4537',
          soft: '#FFE5E1',
        },
        golden: {
          DEFAULT: '#F5B92E', // Golden yellow warning/highlights
          hover: '#DE9E16',
          soft: '#FFF1C9',
        },
        teal: {
          DEFAULT: '#19A89A', // Fresh teal success/pass state
          hover: '#13877B',
          soft: '#DDF6F1',
        },
        violet: {
          DEFAULT: '#6B46D9', // Deep violet secondary brand accent
          hover: '#5733C2',
          soft: '#EFEBFF',
        },
        border: {
          DEFAULT: '#C9D0DD',
          ink: '#C9D0DD',
          subtle: '#E2E6EE',
          strong: '#A9B4C5',
        },
      },
      fontFamily: {
        sans: [
          'Manrope',
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
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
        subtle: '0 1px 3px 0 rgba(24, 35, 58, 0.06)',
        card: '0 4px 16px -2px rgba(24, 35, 58, 0.08), 0 2px 6px -1px rgba(24, 35, 58, 0.04)',
        elevated: '0 12px 32px -4px rgba(24, 35, 58, 0.12), 0 4px 12px -2px rgba(24, 35, 58, 0.06)',
        highlight: '0 0 0 3px rgba(49, 87, 232, 0.25)',
        coralGlow: '0 8px 24px -4px rgba(242, 92, 77, 0.25)',
        electricGlow: '0 8px 24px -4px rgba(49, 87, 232, 0.3)',
      },
    },
  },
  plugins: [],
};
