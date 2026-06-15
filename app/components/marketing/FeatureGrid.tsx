/**
 * Full module/feature grid. Server component.
 * Used on the home page (capped) and the /features page (full).
 */
import { moduleFeatures } from '@/lib/marketing';

interface FeatureGridProps {
  limit?: number;
  title?: string;
  subtitle?: string;
}

export default function FeatureGrid({
  limit,
  title = 'Everything your kitchen needs',
  subtitle = 'One app for inventory, meals, shopping, budgets, household coordination and small-business operations.',
}: FeatureGridProps) {
  const items = limit ? moduleFeatures.slice(0, limit) : moduleFeatures;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{title}</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-700"
          >
            <div className="mb-3 text-3xl">{f.emoji}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{f.title}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
