import { defineConfig } from 'astro/config';

export default defineConfig({
  // Deployment domain
  site: 'https://vinodkumarkp.github.io',

  // Base path for GitHub Pages project site
  base: '/my_portfolio',

  build: {
    outDir: './dist'
  },
  markdown: {
    syntaxHighlight: 'shiki'
  }
});
