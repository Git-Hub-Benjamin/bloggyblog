import { defineConfig } from 'astro/config';

// Detect if this is a build or dev environment
const isBuild = process.argv.includes('build');
const isProduction = process.env.NODE_ENV === 'production' || isBuild;

export default defineConfig({
  site: 'https://git-hub-benjamin.github.io/bloggyblog',
  base: isProduction ? '/bloggyblog/' : '/',
  trailingSlash: 'always',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
