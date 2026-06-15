/**
 * Public marketing footer with sitemap-style link columns.
 * Server component (no interactivity).
 */
import Link from 'next/link';
import Logo from '@/app/components/Logo';
import { siteConfig } from '@/lib/seo';

const columns = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Demo', href: '/demo' },
      { name: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Team', href: '/team' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Help Center', href: '/help' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Get Started', href: '/auth/signup' },
      { name: 'Sign in', href: '/auth/signin' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
    ],
  },
];

export default function MarketingFooter() {
  const year = 2026;
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <Logo size="md" />
            <p className="mt-4 max-w-xs text-sm text-gray-500 dark:text-gray-400">
              {siteConfig.tagline}. Reduce waste, save money, and automate your kitchen — online or offline.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">© {year} {siteConfig.name}. All rights reserved.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Built with Next.js · Firebase · Gemini AI · A final-year project</p>
        </div>
      </div>
    </footer>
  );
}
