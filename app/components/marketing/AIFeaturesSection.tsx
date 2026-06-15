/**
 * Flagship AI features grid — the 7 features that make Pantry Plus an
 * "AI Kitchen Operating System". Server component.
 */
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { flagshipFeatures } from '@/lib/marketing';

export default function AIFeaturesSection() {
  return (
    <section id="ai" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Not another pantry app. An AI Kitchen OS.
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Seven flagship features that automate the decisions other apps make you do by hand.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {flagshipFeatures.map((f) => (
          <Link
            key={f.id}
            href={f.href}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-2xl shadow-md`}>
              <span>{f.emoji}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{f.name}</h3>
            <p className="mt-0.5 text-sm font-medium text-primary-600 dark:text-primary-400">{f.tagline}</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{f.description}</p>
            <ul className="mt-4 space-y-1.5">
              {f.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="mt-0.5 text-accent-500">✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400">
              Explore
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
