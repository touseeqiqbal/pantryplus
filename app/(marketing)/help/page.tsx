import Link from 'next/link';
import PageHero from '@/app/components/marketing/PageHero';
import CTASection from '@/app/components/marketing/CTASection';
import SEOJsonLd, { breadcrumbSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Help Center',
  path: '/help',
  description: 'Get started with Pantry Plus — managing inventory, planning meals, using the AI assistant, sync & offline mode, and troubleshooting.',
});

const topics = [
  {
    emoji: '🚀',
    title: 'Getting started',
    items: [
      'Create a free account (email or Google).',
      'Set up your household or switch to Business Mode.',
      'Add your first inventory items — or scan a receipt.',
      'Install the app to your home screen for offline use.',
    ],
  },
  {
    emoji: '📦',
    title: 'Managing inventory',
    items: [
      'Add items with quantity, unit, location and expiry date.',
      'Use barcode or photo scanning to add items fast.',
      'Watch the dashboard for items expiring soon.',
      'Mark items used to keep counts accurate.',
    ],
  },
  {
    emoji: '🍽️',
    title: 'Planning meals',
    items: [
      'Open the Meal Planner to plan your week.',
      'Let Kitchen Autopilot plan around what you own and your budget.',
      'Generate a shopping list for only what you’re missing.',
      'Use the Waste Coach to cook expiring items first.',
    ],
  },
  {
    emoji: '🤖',
    title: 'Using the AI assistant',
    items: [
      'Ask “what can I cook tonight?” or “what’s expiring?”',
      'Request substitutions when you’re missing an ingredient.',
      'Set family taste preferences for personalized suggestions.',
      'Remember: AI suggestions are guidance, not professional advice.',
    ],
  },
  {
    emoji: '🔄',
    title: 'Sync & offline mode',
    items: [
      'The app works fully offline — changes save on your device.',
      'When you reconnect, data syncs to the cloud automatically.',
      'Use the same account on multiple devices to stay in sync.',
      'A connection indicator shows your online/offline status.',
    ],
  },
  {
    emoji: '🛠️',
    title: 'Troubleshooting',
    items: [
      'Sign-in issues? Confirm your email/password or try Google.',
      'Data not syncing? Check your connection; it will retry automatically.',
      'A browser privacy blocker can block cloud sync — allow the site.',
      'Still stuck? Reach out via the Contact page.',
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      <SEOJsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Help', path: '/help' }])} />
      <PageHero
        eyebrow="Help Center"
        title="How can we help?"
        subtitle="Guides for getting the most out of Pantry Plus."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <div key={t.title} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="text-3xl">{t.emoji}</div>
              <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{t.title}</h2>
              <ul className="mt-3 space-y-2">
                {t.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="mt-0.5 text-primary-500">•</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Looking for quick answers? Visit the{' '}
          <Link href="/faq" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">FAQ</Link>.
        </p>
      </section>

      <CTASection title="Can’t find what you need?" subtitle="Send us a message and we’ll help." primaryLabel="Contact Support" primaryHref="/contact" secondaryLabel="Browse FAQ" secondaryHref="/faq" />
    </>
  );
}
