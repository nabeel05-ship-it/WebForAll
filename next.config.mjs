import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['jsdom', 'axe-core'],
  reactStrictMode: true,
  // Pin the workspace root so a stray lockfile in a parent directory is not mistaken for it.
  turbopack: {
    root: fileURLToPath(new URL('.', import.meta.url)),
  },
};

export default nextConfig;
