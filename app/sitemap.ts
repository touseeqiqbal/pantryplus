import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';
import { getAllPosts } from '@/lib/blog';

/**
 * Public sitemap. Only includes pages we want indexed (marketing + blog).
 * Authenticated app routes are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const routes = [
    '',
    '/features',
    '/pricing',
    '/about',
    '/team',
    '/contact',
    '/faq',
    '/help',
    '/roadmap',
    '/demo',
    '/blog',
    '/privacy',
    '/terms',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...posts];
}
