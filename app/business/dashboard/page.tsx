/**
 * Business dashboard — KPIs for a small food business. Server component (demo).
 * TODO: compute from real orders, menu costing and inventory in Firestore.
 */
import Link from 'next/link';
import AppPageHeader from '@/app/components/AppPageHeader';
import { demoBusinessKpis, demoCosting, costingMetrics } from '@/lib/demo-data';

export const metadata = { title: 'Business Dashboard' };

export default function BusinessDashboardPage() {
  const k = demoBusinessKpis;
  const profit = k.revenueMonth - k.costMonth;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader emoji="📈" title="Business Dashboard" subtitle="This month at a glance." gradient="from-violet-500 to-fuchsia-600" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Revenue', value: `$${k.revenueMonth.toLocaleString()}`, tone: 'text-gray-900 dark:text-white' },
          { label: 'Cost', value: `$${k.costMonth.toLocaleString()}`, tone: 'text-gray-900 dark:text-white' },
          { label: 'Profit', value: `$${profit.toLocaleString()}`, tone: 'text-accent-600 dark:text-accent-400' },
          { label: 'Orders', value: k.ordersMonth, tone: 'text-primary-600 dark:text-primary-400' },
          { label: 'Avg margin', value: `${k.avgMargin}%`, tone: 'text-accent-600 dark:text-accent-400' },
          { label: 'Waste', value: `$${k.wasteMonth}`, tone: 'text-amber-600 dark:text-amber-400' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className={`text-xl font-extrabold ${c.tone}`}>{c.value}</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">Menu profitability</h2>
          <Link href="/business/costing" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">Full costing →</Link>
        </div>
        <ul className="space-y-3">
          {demoCosting.map((c) => {
            const m = costingMetrics(c);
            return (
              <li key={c.item} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">{c.emoji} {c.item}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-2 rounded-full bg-accent-500" style={{ width: `${Math.max(0, Math.min(100, m.margin))}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm font-semibold text-accent-600 dark:text-accent-400">{m.margin.toFixed(0)}%</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
