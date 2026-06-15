/**
 * Order tracking — new → preparing → ready → delivered. Server (demo).
 * TODO: back with a Firestore `orders` collection scoped to the business.
 */
import AppPageHeader from '@/app/components/AppPageHeader';
import { demoBusinessOrders, type BusinessOrder } from '@/lib/demo-data';

export const metadata = { title: 'Orders' };

const statusMeta: Record<BusinessOrder['status'], { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' },
  preparing: { label: 'Preparing', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  ready: { label: 'Ready', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  delivered: { label: 'Delivered', cls: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300' },
};

export default function OrdersPage() {
  const revenue = demoBusinessOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader emoji="🧾" title="Orders" subtitle={`${demoBusinessOrders.length} active orders · $${revenue} value`} gradient="from-violet-500 to-fuchsia-600" />

      <div className="space-y-3">
        {demoBusinessOrders.map((o) => {
          const s = statusMeta[o.status];
          return (
            <div key={o.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{o.id} · {o.customer}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{o.qty} × {o.item}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">${o.total}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
