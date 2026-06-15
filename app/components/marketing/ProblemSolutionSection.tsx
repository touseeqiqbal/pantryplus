/**
 * Problem → Solution comparison section. Server component.
 */
import { problems, solutions } from '@/lib/marketing';

export default function ProblemSolutionSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            The kitchen is broken. We fixed the workflow.
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Every household faces the same four problems. Pantry Plus turns each one into an automated solution.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Problems */}
          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-6 dark:border-red-900/40 dark:bg-red-900/10">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-red-700 dark:text-red-300">The problem</h3>
            <ul className="space-y-4">
              {problems.map((p) => (
                <li key={p.title} className="flex gap-3">
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{p.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="rounded-2xl border border-accent-200 bg-accent-50/60 p-6 dark:border-accent-900/40 dark:bg-accent-900/10">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-accent-700 dark:text-accent-300">The Pantry Plus way</h3>
            <ul className="space-y-4">
              {solutions.map((s) => (
                <li key={s.title} className="flex gap-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{s.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{s.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
