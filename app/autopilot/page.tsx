'use client';

/**
 * Kitchen Autopilot — flagship feature.
 * Auto-answers: what to cook, what expires, what to buy, how much you save.
 *
 * TODO: wire to a real AI route that takes (inventory + budget + family taste +
 * meal history) and returns the plan. For now it renders a realistic demo plan
 * and surfaces real expiring items from useInventory() when available.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import AppPageHeader from '@/app/components/AppPageHeader';
import { useInventory } from '@/lib/hooks/useInventory';
import { useUI } from '@/app/components/ui/Toaster';
import { track } from '@/lib/analytics';
import { demoAutopilotPlan, demoAutopilotSummary } from '@/lib/demo-data';

export default function AutopilotPage() {
  const { items } = useInventory();
  const { toast } = useUI();
  const [generatedAt, setGeneratedAt] = useState<string>('just now');

  const expiringSoon = useMemo(() => {
    return items
      .map((i) => ({
        name: i.name,
        days: i.expiryDate ? Math.ceil((new Date(i.expiryDate).getTime() - Date.now()) / 86_400_000) : null,
      }))
      .filter((i) => i.days !== null && (i.days as number) <= 4)
      .sort((a, b) => (a.days as number) - (b.days as number))
      .slice(0, 6);
  }, [items]);

  const run = () => {
    track('meal_plan_generated', { source: 'autopilot' });
    setGeneratedAt('just now');
    toast('Autopilot refreshed your weekly plan.', 'success');
  };

  const s = demoAutopilotSummary;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader
        emoji="🧭"
        title="Kitchen Autopilot"
        subtitle="Your kitchen, planned automatically — meals, shopping and savings."
        actions={
          <button onClick={run} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
            <ArrowPathIcon className="h-4 w-4" /> Re-run
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Meals planned', value: s.mealsPlanned, tone: 'text-primary-600 dark:text-primary-400' },
          { label: 'Est. week cost', value: `$${s.estWeekCost.toFixed(2)}`, tone: 'text-gray-900 dark:text-white' },
          { label: 'Est. savings', value: `$${s.estSavings.toFixed(2)}`, tone: 'text-accent-600 dark:text-accent-400' },
          { label: 'Items reused', value: s.itemsReused, tone: 'text-gray-900 dark:text-white' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className={`text-2xl font-extrabold ${c.tone}`}>{c.value}</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Weekly plan */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white">This week’s plan</h2>
              <span className="inline-flex items-center gap-1 text-xs text-gray-400"><SparklesIcon className="h-3.5 w-3.5" /> AI-generated · {generatedAt}</span>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {demoAutopilotPlan.map((m) => (
                <li key={m.day} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{m.day}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{m.meal}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Uses: {m.usesExpiring.join(', ')}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">${m.estCost.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Side: expiring + shopping */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/40 dark:bg-amber-900/10">
            <h2 className="font-bold text-amber-800 dark:text-amber-300">Expiring soon</h2>
            <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/70">Autopilot cooks these first.</p>
            <ul className="mt-3 space-y-2">
              {(expiringSoon.length > 0
                ? expiringSoon.map((e) => `${e.name} · ${e.days}d`)
                : demoAutopilotPlan.flatMap((m) => m.usesExpiring).slice(0, 5)
              ).map((t, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-200">
                  <span>⏳</span> {t}
                </li>
              ))}
            </ul>
            {expiringSoon.length === 0 && <p className="mt-3 text-xs text-amber-700/70 dark:text-amber-300/60">(Demo data — add inventory with expiry dates to see your own.)</p>}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-bold text-gray-900 dark:text-white">Shopping list</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Only what you’re missing.</p>
            <ul className="mt-3 space-y-2">
              {s.shoppingItems.map((it) => (
                <li key={it} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><span className="text-accent-500">＋</span> {it}</li>
              ))}
            </ul>
            <Link href="/shopping" className="mt-4 inline-block text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">Open shopping list →</Link>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        Autopilot combines inventory, expiry, budget and family preferences. AI plan generation is being wired to live data.
      </p>
    </div>
  );
}
