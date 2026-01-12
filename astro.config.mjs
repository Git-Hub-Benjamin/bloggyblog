import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://git-hub-benjamin.github.io/bloggyblog',
  base: process.env.NODE_ENV === 'production' ? '/bloggyblog' : '/',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
