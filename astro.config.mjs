import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bloggyblog.com',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
