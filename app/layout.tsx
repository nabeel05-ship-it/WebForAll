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
  metadataBase: new URL('https://webforall-seven.vercel.app'),
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
  icons: {
    icon: [
      { url: '/brand/webforall-icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/webforall-icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/brand/webforall-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'WebForAll — Web Accessibility Evaluation & Remediation',
    description: 'A More Accessible Web for Everyone. Automated axe-core evaluation in ephemeral memory.',
    images: [
      {
        url: '/brand/webforall-full-logo.png',
        width: 1200,
        height: 630,
        alt: 'WebForAll — A More Accessible Web for Everyone',
      },
    ],
  },
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
