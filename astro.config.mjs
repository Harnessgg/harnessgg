import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://harness.gg',
  compressHTML: true,
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { '@': '/src' },
    },
  },
});