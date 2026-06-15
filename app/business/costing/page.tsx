/**
 * Recipe Costing — flagship business feature.
 * Cost per serving, profit and margin for each menu item. Server component (demo).
 * TODO: replace demo items with useMenuItems() + useIngredientMapping() costing.
 */
import AppPageHeader from '@/app/components/AppPageHeader';
import { demoCosting, costingMetrics } from '@/lib/demo-data';

export const metadata = { title: 'Recipe Costing' };

export default function CostingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader emoji="📊" title="Recipe Costing" subtitle="Know the profit in every plate." gradient="from-violet-500 to-fuchsia-600" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {demoCosting.map((c) => {
          const m = costingMetrics(c);
          const marginTone = m.margin >= 50 ? 'text-accent-600 dark:text-accent-400' : m.margin >= 30 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
          return (
            <div key={c.item} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{c.emoji}</span>
                <h2 className="font-bold text-gray-900 dark:text-white">{c.item}</h2>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Ingredient cost</dt><dd className="font-medium text-gray-900 dark:text-white">${c.ingredientCost.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Packaging</dt><dd className="font-medium text-gray-900 dark:text-white">${c.packaging.toFixed(2)}</dd></div>
                <div className="flex justify-between border-t border-gray-100 pt-2 dark:border-gray-800"><dt className="text-gray-500 dark:text-gray-400">Total cost</dt><dd className="font-semibold text-gray-900 dark:text-white">${m.cost.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Selling price</dt><dd className="font-semibold text-gray-900 dark:text-white">${c.sellingPrice.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Profit</dt><dd className="font-bold text-accent-600 dark:text-accent-400">${m.profit.toFixed(2)}</dd></div>
              </dl>
              <div className="mt-4 rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-800/60">
                <div className={`text-2xl font-extrabold ${marginTone}`}>{m.margin.toFixed(0)}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Profit margin</div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        Demo items. Selling an item deducts its ingredients from stock automatically (coming soon).
      </p>
    </div>
  );
}
