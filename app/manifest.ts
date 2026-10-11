import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WebForAll — Web Accessibility Evaluation & Remediation',
    short_name: 'WebForAll',
    description: 'A More Accessible Web for Everyone. Automated axe-core evaluation in ephemeral memory.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F2F0FF',
    theme_color: '#3157E8',
    icons: [
      {
        src: '/brand/webforall-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/brand/webforall-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
