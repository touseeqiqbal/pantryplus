/**
 * Final call-to-action band. Server component.
 */
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export default function CTASection({
  title = 'Ready to put your kitchen on autopilot?',
  subtitle = 'Join households and small food businesses saving money and wasting less — free to start, works offline.',
  primaryHref = '/auth/signup',
  primaryLabel = 'Get Started Free',
  secondaryHref = '/demo',
  secondaryLabel = 'See the Demo',
}: CTASectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-purple-600 px-6 py-14 text-center shadow-2xl sm:px-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white blur-2xl" />
        </div>
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl text-balance">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-100 text-balance">{subtitle}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-primary-700 shadow-lg transition-transform hover:scale-105"
            >
              {primaryLabel}
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-xl border border-white/40 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
