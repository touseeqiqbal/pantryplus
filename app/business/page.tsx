/**
 * Business Mode hub — the "Small Food Business Co-Pilot".
 * Links to all business tools. Server component.
 */
import Link from 'next/link';
import AppPageHeader from '@/app/components/AppPageHeader';

export const metadata = { title: 'Business Mode' };

const tools = [
  { emoji: '📈', title: 'Dashboard', desc: 'Revenue, cost, orders and margin at a glance.', href: '/business/dashboard' },
  { emoji: '📊', title: 'Recipe Costing', desc: 'Cost per serving, profit and margin for every item.', href: '/business/costing' },
  { emoji: '🍔', title: 'Menu', desc: 'Manage your menu items and recipes.', href: '/business/menu' },
  { emoji: '🥕', title: 'Ingredients', desc: 'Stock levels, unit costs and low-stock alerts.', href: '/business/ingredients' },
  { emoji: '📋', title: 'Prep', desc: 'Daily prep checklists for your kitchen.', href: '/business/prep' },
  { emoji: '🧾', title: 'Orders', desc: 'Track incoming orders from new to delivered.', href: '/business/orders' },
  { emoji: '🚚', title: 'Suppliers', desc: 'Your supplier list, contacts and ratings.', href: '/business/suppliers' },
];

export default function BusinessHubPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader emoji="🏪" title="Business Mode" subtitle="The co-pilot for home bakers, tiffin services, cafés & cloud kitchens." gradient="from-violet-500 to-fuchsia-600" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.href} href={t.href} className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <div className="text-3xl">{t.emoji}</div>
            <h2 className="mt-3 font-bold text-gray-900 dark:text-white">{t.title}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t.desc}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-primary-600 group-hover:translate-x-1 dark:text-primary-400">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
