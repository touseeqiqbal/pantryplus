/**
 * Pricing tiers. Server component (links only — no payment integration yet).
 */
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/outline';
import { pricingTiers } from '@/lib/marketing';

interface PricingCardsProps {
  title?: string;
  subtitle?: string;
  withHeading?: boolean;
}

export default function PricingCards({
  title = 'Simple pricing that grows with you',
  subtitle = 'Start free. Upgrade when the AI starts running your kitchen. Business plans for food sellers.',
  withHeading = true,
}: PricingCardsProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {withHeading && (
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>
        </div>
      )}

      <div className="mt-14 grid gap-6 lg:grid-cols-4">
        {pricingTiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              tier.highlighted
                ? 'border-primary-500 bg-white shadow-xl ring-1 ring-primary-500 dark:bg-gray-900'
                : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
            }`}
          >
            {tier.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white shadow">
                {tier.badge}
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tier.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{tier.price}</span>
              {tier.period && <span className="text-sm text-gray-500 dark:text-gray-400">{tier.period}</span>}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tier.description}</p>

            <ul className="mt-6 flex-1 space-y-3">
              {tier.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-500" />
                  {feat}
                </li>
              ))}
            </ul>

            <Link
              href={tier.ctaHref}
              className={`mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                tier.highlighted
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        Payments are not yet enabled — Pro &amp; Business are in early access. Contact us to join.
      </p>
    </section>
  );
}
