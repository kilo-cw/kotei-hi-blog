// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// 独自ドメインに移ったら site を書き換える
export default defineConfig({
  site: 'https://kotei-hi-blog.pages.dev',
  integrations: [mdx(), sitemap()],
  trailingSlash: 'always',
});
