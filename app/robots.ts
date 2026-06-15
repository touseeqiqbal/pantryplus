import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

/**
 * robots.txt. Allows crawling of public pages; keeps authenticated app routes
 * and API endpoints out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard',
        '/inventory',
        '/shopping',
        '/meals',
        '/recipes',
        '/tasks',
        '/expenses',
        '/household',
        '/settings',
        '/integrations',
        '/assistant',
        '/waste-coach',
        '/budget-planner',
        '/health',
        '/insights',
        '/scan',
        '/autopilot',
        '/family',
        '/business',
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
