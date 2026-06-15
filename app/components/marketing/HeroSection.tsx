/**
 * Marketing hero. Server component (CSS reveal animation — SEO-friendly).
 */
import Link from 'next/link';
import { SparklesIcon, ArrowRightIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import { aiPreviewPrompts, impactStats } from '@/lib/marketing';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary-200/40 to-purple-200/30 blur-3xl dark:from-primary-900/30 dark:to-purple-900/20" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
            <SparklesIcon className="h-4 w-4" />
            The AI Kitchen Operating System
          </span>

          <h1 className="animate-fade-in-up mt-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl text-balance" style={{ animationDelay: '60ms' }}>
            Your AI-powered{' '}
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">kitchen assistant.</span>
          </h1>

          <p className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300 text-balance" style={{ animationDelay: '120ms' }}>
            Reduce food waste, plan meals, track groceries, manage budgets, and coordinate your
            household kitchen — online or offline.
          </p>

          <div className="animate-fade-in-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: '180ms' }}>
            <Link
              href="/auth/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:shadow-xl"
            >
              Get Started
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-3.5 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <PlayCircleIcon className="h-5 w-5" />
              View Demo
            </Link>
          </div>

          {/* AI prompt preview chips */}
          <div className="animate-fade-in-up mt-10 flex flex-wrap items-center justify-center gap-2" style={{ animationDelay: '240ms' }}>
            {aiPreviewPrompts.slice(0, 4).map((p) => (
              <span key={p} className="rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300">
                “{p}”
              </span>
            ))}
          </div>
        </div>

        {/* Impact stats */}
        <dl className="animate-fade-in-up mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 text-center dark:border-gray-800 dark:bg-gray-800 sm:grid-cols-4" style={{ animationDelay: '300ms' }}>
          {impactStats.map((s) => (
            <div key={s.label} className="bg-white px-4 py-6 dark:bg-gray-900">
              <dt className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{s.value}</dt>
              <dd className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
