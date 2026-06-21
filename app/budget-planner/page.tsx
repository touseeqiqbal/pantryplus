'use client';

/**
 * Budget Survival Mode — "I have $X, feed me for N days."
 * Generates a cheap meal plan, cost estimate, reused pantry items and a
 * shopping list.
 *
 * TODO: replace the mock generator with an AI route that takes the form values
 * and returns a real plan. Inputs are validated with Zod.
 */
import { useState } from 'react';
import { z } from 'zod';
import { BanknotesIcon, SparklesIcon } from '@heroicons/react/24/outline';
import AppPageHeader from '@/app/components/AppPageHeader';
import { useUI } from '@/app/components/ui/Toaster';
import { useCountry } from '@/lib/hooks/useCountry';
import { track } from '@/lib/analytics';
import { demoBudgetPlan, demoBudgetSummary } from '@/lib/demo-data';

const planSchema = z.object({
  budget: z.coerce.number().positive('Enter a budget above 0.'),
  days: z.coerce.number().int().min(1).max(14),
  familySize: z.coerce.number().int().min(1).max(12),
  diet: z.string(),
  allergies: z.string().optional(),
  ingredients: z.string().optional(),
});

const cuisines = ['Any', 'Pakistani', 'Indian', 'Arab', 'Turkish', 'Chinese', 'Italian', 'Mexican', 'Vegetarian', 'Halal', 'Vegan', 'High-protein', 'Student budget'];

export default function BudgetPlannerPage() {
  const { toast } = useUI();
  const { country, formatPrice } = useCountry();
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ budget: '25', days: '5', familySize: '1', diet: 'Student budget', allergies: 'Peanuts', ingredients: 'rice, eggs, lentils, potatoes, yogurt' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = planSchema.safeParse(form);
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message || 'Please check the form.', 'error');
      return;
    }
    setLoading(true);
    track('budget_plan_generated', { budget: parsed.data.budget, days: parsed.data.days, country: country.code });
    // TODO: await fetch('/api/budget/generate', { method:'POST',
    //   body: JSON.stringify({ ...parsed.data, country: country.code, currency: country.currency, cuisines: country.cuisines }) })
    await new Promise((r) => setTimeout(r, 700));
    setGenerated(true);
    setLoading(false);
    toast('Your budget meal plan is ready!', 'success');
  };

  const inputCls = 'w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white';
  const s = demoBudgetSummary;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader emoji="💸" title="Budget Survival Mode" subtitle="Eat well on a tight budget — AI does the math." gradient="from-amber-500 to-orange-600" />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <form onSubmit={generate} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Budget ({country.currencySymbol})</label>
              <input value={form.budget} onChange={set('budget')} inputMode="decimal" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Days</label>
              <input value={form.days} onChange={set('days')} inputMode="numeric" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">People</label>
              <input value={form.familySize} onChange={set('familySize')} inputMode="numeric" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Cuisine / diet</label>
            <select value={form.diet} onChange={set('diet')} className={inputCls}>
              {Array.from(new Set([...country.cuisines, ...cuisines])).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Allergies</label>
            <input value={form.allergies} onChange={set('allergies')} className={inputCls} placeholder="e.g. peanuts, shellfish" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Available ingredients</label>
            <input value={form.ingredients} onChange={set('ingredients')} className={inputCls} placeholder="rice, eggs, lentils…" />
          </div>
          <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
            {loading ? 'Generating…' : (<><SparklesIcon className="h-4 w-4" /> Generate plan</>)}
          </button>
        </form>

        {/* Results */}
        <div className="lg:col-span-3">
          {!generated ? (
            <div className="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-8 text-center dark:border-gray-700 dark:bg-gray-800/40">
              <BanknotesIcon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 max-w-xs text-sm text-gray-500 dark:text-gray-400">Enter your budget and ingredients, then generate a survival meal plan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
                  <div className="text-xl font-extrabold text-gray-900 dark:text-white">{formatPrice(s.estCost)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Est. cost</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
                  <div className="text-xl font-extrabold text-accent-600 dark:text-accent-400">{formatPrice(s.remaining)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Left over</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
                  <div className="text-xl font-extrabold text-primary-600 dark:text-primary-400">{s.days}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Days covered</div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-3 font-bold text-gray-900 dark:text-white">Meal plan</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase text-gray-400">
                      <tr><th className="py-2">Day</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {demoBudgetPlan.map((d) => (
                        <tr key={d.day} className="text-gray-700 dark:text-gray-300">
                          <td className="py-2 font-semibold">{d.day}</td>
                          <td>{d.breakfast}</td><td>{d.lunch}</td><td>{d.dinner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="font-bold text-gray-900 dark:text-white">Reused from pantry</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">{s.reusedItems.map((i) => <span key={i} className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">{i}</span>)}</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="font-bold text-gray-900 dark:text-white">Shopping list</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">{s.shoppingList.map((i) => <span key={i} className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{i}</span>)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
