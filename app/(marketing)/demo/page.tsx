import Link from 'next/link';
import PageHero from '@/app/components/marketing/PageHero';
import CTASection from '@/app/components/marketing/CTASection';
import SEOJsonLd, { breadcrumbSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Demo',
  path: '/demo',
  description: 'See Pantry Plus in action — add inventory, go offline, sync, ask the AI for recipes, generate a shopping list, scan a receipt, and use business costing.',
});

const steps = [
  { n: 1, emoji: '📦', title: 'Add inventory', text: 'Add a few items (rice, eggs, spinach, yogurt) with quantities and expiry dates — or scan a receipt to auto-fill them.', href: '/inventory' },
  { n: 2, emoji: '📴', title: 'Go offline', text: 'Turn off your network. The app keeps working — add and edit items with zero connection.', href: '/inventory' },
  { n: 3, emoji: '🔄', title: 'Reconnect & sync', text: 'Turn the network back on. Watch your offline changes sync to the cloud automatically.', href: '/dashboard' },
  { n: 4, emoji: '🤖', title: 'Ask the AI', text: '“What can I cook tonight?” The Living Kitchen Brain suggests meals from what you have.', href: '/assistant' },
  { n: 5, emoji: '🛒', title: 'Generate a shopping list', text: 'Let Autopilot build a list of only the items you’re missing for the week.', href: '/autopilot' },
  { n: 6, emoji: '🧾', title: 'Scan a receipt', text: 'Snap a grocery receipt — AI turns it into inventory and an expense entry.', href: '/scan' },
  { n: 7, emoji: '📊', title: 'Try business costing', text: 'Switch to Business Mode and calculate the profit margin on a menu item like biryani.', href: '/business' },
];

export default function DemoPage() {
  return (
    <>
      <SEOJsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Demo', path: '/demo' }])} />
      <PageHero
        eyebrow="Guided demo"
        title="Take Pantry Plus for a spin"
        subtitle="Follow these seven steps to experience the full AI Kitchen OS — offline included."
      />

      {/* Killer demo story */}
      <section className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-primary-200 bg-primary-50/60 p-6 dark:border-primary-800 dark:bg-primary-900/20">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">The 60-second story</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            A student has just <strong>$25</strong> left for groceries. Pantry Plus scans their pantry,
            finds rice, eggs, potatoes, lentils and yogurt, and builds a <strong>5-day budget meal plan</strong>
            {' '}— using the expiring yogurt first. It generates a shopping list for only the missing items,
            estimates the cost, and shows the money saved. Then a home food seller switches to
            <strong> Business Mode</strong> to calculate the profit margin on biryani and update stock.
            That’s AI, offline-first, real-world usefulness — in one app.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <ol className="space-y-4">
          {steps.map((s) => (
            <li key={s.n}>
              <Link
                href={s.href}
                className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-700"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xl dark:bg-primary-900/30">{s.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    <span className="text-primary-600 dark:text-primary-400">Step {s.n}.</span> {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{s.text}</p>
                </div>
                <span className="self-center text-primary-500 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          You’ll need a free account to use the live app.{' '}
          <Link href="/auth/signup" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">Create one →</Link>
        </p>
      </section>

      <CTASection title="Ready to try it yourself?" />
    </>
  );
}
