import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vinodkumarkp.github.io',
  base: '/my_portfolio',
  build: {
    outDir: './dist'
  },
  markdown: {
    syntaxHighlight: 'shiki'
  }
});
