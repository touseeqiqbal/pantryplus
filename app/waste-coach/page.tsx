'use client';

/**
 * Food Waste Coach — "Use Before Waste" engine.
 * Shows what to use today/this week, freeze, or donate — with measurable impact.
 *
 * TODO: derive items from useInventory() expiry dates and call an AI route for
 * recipe ideas from expiring ingredients. Demo data shown when inventory empty.
 */
import { useMemo } from 'react';
import Link from 'next/link';
import AppPageHeader from '@/app/components/AppPageHeader';
import { useInventory } from '@/lib/hooks/useInventory';
import { track } from '@/lib/analytics';
import {
  demoWasteItems,
  demoWasteImpact,
  demoStorageTips,
  type WasteAction,
  type WasteItem,
} from '@/lib/demo-data';

const actionMeta: Record<WasteAction, { label: string; cls: string; emoji: string }> = {
  'use-today': { label: 'Use today', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', emoji: '🔥' },
  'use-week': { label: 'Use this week', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', emoji: '📅' },
  freeze: { label: 'Freeze now', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300', emoji: '❄️' },
  donate: { label: 'Donate soon', cls: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300', emoji: '🤝' },
};

function deriveAction(days: number): WasteAction {
  if (days <= 1) return 'use-today';
  if (days <= 4) return 'use-week';
  if (days <= 14) return 'freeze';
  return 'donate';
}

export default function WasteCoachPage() {
  const { items } = useInventory();

  const liveItems: WasteItem[] = useMemo(() => {
    return items
      .map((i) => {
        const days = i.expiryDate ? Math.ceil((new Date(i.expiryDate).getTime() - Date.now()) / 86_400_000) : null;
        return { i, days };
      })
      .filter((x) => x.days !== null && (x.days as number) <= 14)
      .sort((a, b) => (a.days as number) - (b.days as number))
      .slice(0, 8)
      .map(({ i, days }) => ({
        name: i.name,
        qty: `${i.quantity} ${i.unit}`,
        daysLeft: days as number,
        action: deriveAction(days as number),
        value: 0,
        tip: 'Plan a meal around this before it expires.',
      }));
  }, [items]);

  const usingDemo = liveItems.length === 0;
  const list = usingDemo ? demoWasteItems : liveItems;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader
        emoji="♻️"
        title="Food Waste Coach"
        subtitle="Use it before you lose it — and see the money and CO₂ you save."
        gradient="from-emerald-500 to-teal-600"
      />

      {/* Impact */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Saved this month', value: `$${demoWasteImpact.monthSaved.toFixed(2)}`, tone: 'text-accent-600 dark:text-accent-400' },
          { label: 'Waste avoided', value: `${demoWasteImpact.wasteAvoidedKg} kg`, tone: 'text-gray-900 dark:text-white' },
          { label: 'CO₂ avoided', value: `${demoWasteImpact.co2AvoidedKg} kg`, tone: 'text-gray-900 dark:text-white' },
          { label: 'Meals created', value: demoWasteImpact.mealsCreated, tone: 'text-primary-600 dark:text-primary-400' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className={`text-2xl font-extrabold ${c.tone}`}>{c.value}</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Action list */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Use before waste</h2>
            {usingDemo && <span className="text-xs text-gray-400">Demo data</span>}
          </div>
          <ul className="space-y-3">
            {list.map((item) => {
              const meta = actionMeta[item.action];
              return (
                <li key={item.name} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name} <span className="text-xs font-normal text-gray-400">· {item.qty}</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.tip}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}>{meta.emoji} {meta.label}</span>
                    <span className="text-xs text-gray-400">{item.daysLeft}d left</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link href="/assistant" className="mt-4 inline-block text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Ask AI for recipes from these →
          </Link>
        </div>

        {/* Storage tips */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-bold text-gray-900 dark:text-white">Storage & preservation tips</h2>
          <ul className="mt-3 space-y-3">
            {demoStorageTips.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="mt-0.5">💡</span> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
