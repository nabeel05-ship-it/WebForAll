import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SkipToContent from '@/components/SkipToContent';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F2F0FF',
};

export const metadata: Metadata = {
  title: 'WebForAll — Web Accessibility Evaluation & Remediation',
  description:
    'Find accessibility barriers on your website, understand who is affected, and get practical developer guidance to fix them. Powered by axe-core in ephemeral memory.',
  keywords: [
    'web accessibility',
    'WCAG',
    'a11y',
    'axe-core',
    'accessibility scanner',
    'inclusive design',
  ],
  authors: [{ name: 'WebForAll Project' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-canvas text-ink antialiased selection:bg-electric-soft selection:text-electric text-[17px] leading-relaxed">
        <SkipToContent />
        <Header />
        <main id="main-content" className="flex-grow focus:outline-none" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
