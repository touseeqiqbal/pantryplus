/**
 * Supplier list — contacts and ratings. Server (demo).
 * TODO: back with a Firestore `suppliers` collection scoped to the business.
 */
import AppPageHeader from '@/app/components/AppPageHeader';
import { demoSuppliers } from '@/lib/demo-data';

export const metadata = { title: 'Suppliers' };

export default function SuppliersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader emoji="🚚" title="Suppliers" subtitle="Your supplier contacts and ratings." gradient="from-violet-500 to-fuchsia-600" />

      <div className="grid gap-4 sm:grid-cols-2">
        {demoSuppliers.map((s) => (
          <div key={s.name} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white">{s.name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">⭐ {s.rating}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.category}</p>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{s.contact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
