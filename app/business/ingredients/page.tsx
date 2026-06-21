/**
 * Business ingredients — stock, unit cost and low-stock alerts. Server (demo).
 * TODO: back with Firestore inventory scoped to the business + stock deduction.
 */
import AppPageHeader from '@/app/components/AppPageHeader';
import Price from '@/app/components/Price';
import { demoBusinessIngredients } from '@/lib/demo-data';

export const metadata = { title: 'Business Ingredients' };

export default function BusinessIngredientsPage() {
  const lowCount = demoBusinessIngredients.filter((i) => i.lowStock).length;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader emoji="🥕" title="Ingredients & Stock" subtitle={`${demoBusinessIngredients.length} ingredients · ${lowCount} low on stock`} gradient="from-violet-500 to-fuchsia-600" />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-400 dark:bg-gray-800/60">
            <tr><th className="px-4 py-3">Ingredient</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Unit cost</th><th className="px-4 py-3">Supplier</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {demoBusinessIngredients.map((i) => (
              <tr key={i.name} className="text-gray-700 dark:text-gray-300">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {i.name}
                  {i.lowStock && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">Low</span>}
                </td>
                <td className="px-4 py-3">{i.stock}</td>
                <td className="px-4 py-3"><Price value={i.unitCost} /></td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{i.supplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
