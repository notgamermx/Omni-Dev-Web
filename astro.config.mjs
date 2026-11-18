import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import path from 'path';

export default defineConfig({
  site: 'https://omnidev.dev',
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],
  // Image optimization for Cloudflare
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  // Compression
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  // Vite config for GSAP and path aliases
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        '@components': path.resolve('./src/components'),
        '@lib': path.resolve('./src/lib'),
        '@styles': path.resolve('./src/styles'),
        '@types': path.resolve('./src/types'),
      },
    },
    optimizeDeps: {
      include: ['gsap'],
    },
    define: {
      // Prevent GSAP from checking for window in SSR
      'process.env.NODE_ENV': '"production"',
    },
  },
});