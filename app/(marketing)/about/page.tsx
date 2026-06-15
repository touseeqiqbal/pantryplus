import Link from 'next/link';
import PageHero from '@/app/components/marketing/PageHero';
import CTASection from '@/app/components/marketing/CTASection';
import SEOJsonLd, { breadcrumbSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';
import { impactStats } from '@/lib/marketing';

export const metadata = buildMetadata({
  title: 'About',
  path: '/about',
  description:
    'Pantry Plus helps households and small food businesses reduce food waste, save money, plan meals and manage kitchen operations with AI — online or offline.',
});

const objectives = [
  'Reduce food waste in homes and small kitchens',
  'Save grocery expenses with smarter planning',
  'Make daily meal decisions effortless',
  'Work fully offline, sync when connected',
  'Support households and small food businesses',
  'Provide genuinely useful AI recommendations',
];

export default function AboutPage() {
  return (
    <>
      <SEOJsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])} />
      <PageHero
        eyebrow="Our mission"
        title="Help people eat better, waste less, and spend smarter"
        subtitle="Pantry Plus is the AI Kitchen Operating System for homes, families and small food businesses."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose-style space-y-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            Households throw away nearly a third of the food they buy, overspend on groceries, and
            struggle to coordinate inventory, meal planning, shopping and kitchen tasks. Small food
            businesses face the same chaos — without clear visibility into cost, waste or profit.
          </p>
          <p>
            <strong className="text-gray-900 dark:text-white">Pantry Plus</strong> combines
            local-first storage, cloud sync, AI assistance, receipt scanning, meal planning and
            collaborative household tools to reduce waste and make kitchen management effortless —
            for families and the people who cook for a living.
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-bold text-gray-900 dark:text-white">Our objectives</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {objectives.map((o) => (
            <li key={o} className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              <span className="text-accent-500">✓</span>
              {o}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 text-center dark:border-gray-800 dark:bg-gray-800 sm:grid-cols-4 my-16">
          {impactStats.map((s) => (
            <div key={s.label} className="bg-white px-4 py-8 dark:bg-gray-900">
              <div className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{s.value}</div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="pb-12 text-center">
          <Link href="/team" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Meet the team →
          </Link>
        </div>
      </section>

      <CTASection />
    </>
  );
}
