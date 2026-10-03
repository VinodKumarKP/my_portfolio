import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vinodkumarkp.github.io',
  base: '/portfolio',
  build: {
    outDir: './dist'
  },
  markdown: {
    syntaxHighlight: 'shiki'
  }
});
