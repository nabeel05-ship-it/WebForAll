export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-5 focus:py-2.5 focus:bg-electric focus:text-white focus:rounded-md focus:shadow-elevated focus:outline-none focus:ring-4 focus:ring-electric-soft font-bold text-base transition-all"
    >
      Skip to main content
    </a>
  );
}
