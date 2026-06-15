/**
 * Centralized SEO helpers for the App Router.
 *
 * `buildMetadata()` returns a Next.js `Metadata` object with sensible Open
 * Graph / Twitter defaults so every public page can declare SEO in one line:
 *
 *   export const metadata = buildMetadata({
 *     title: 'Pricing',
 *     description: '...',
 *     path: '/pricing',
 *   });
 */
import type { Metadata } from 'next';

export const siteConfig = {
  name: 'Pantry Plus',
  // Short, keyword-aware tagline used as the title-template suffix.
  shortName: 'Pantry Plus',
  tagline: 'The AI Kitchen Operating System',
  description:
    'Pantry Plus is the AI Kitchen Operating System for homes, families, and small food businesses. It automates meal decisions, reduces food waste, saves grocery money, and runs your kitchen — online or offline.',
  // Site URL drives canonical + Open Graph URLs. Override in production via env.
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://pantryplus.app').replace(/\/$/, ''),
  ogImage: '/opengraph-image',
  twitter: '@pantryplus',
  keywords: [
    'AI kitchen assistant',
    'pantry management app',
    'AI meal planner',
    'grocery budget app',
    'food waste reduction app',
    'kitchen inventory app',
    'offline-first PWA',
    'household management app',
    'recipe planning app',
    'small food business inventory',
  ],
};

/** Resolve a site-relative path to an absolute URL (for canonical/OG tags). */
export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path;
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}

interface BuildMetadataOptions {
  title?: string;
  description?: string;
  /** Site-relative path, e.g. "/pricing". Used for canonical + OG url. */
  path?: string;
  /** Extra keywords merged with the site defaults. */
  keywords?: string[];
  image?: string;
  /** Set true for legal/utility pages you don't want indexed prominently. */
  noIndex?: boolean;
  type?: 'website' | 'article';
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = '/',
  keywords = [],
  image,
  noIndex = false,
  type = 'website',
}: BuildMetadataOptions = {}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image || siteConfig.ogImage;
  const fullTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} — AI-Powered Kitchen Management`;

  return {
    title: fullTitle,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: siteConfig.twitter,
    },
  };
}
