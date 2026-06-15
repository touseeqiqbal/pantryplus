/**
 * AI Family Taste Memory — per-person preferences that personalize AI suggestions.
 * Server component rendering demo profiles.
 *
 * TODO: persist profiles to Firestore under the household and feed them into the
 * AI prompts (assistant, autopilot, budget planner).
 */
import Link from 'next/link';
import AppPageHeader from '@/app/components/AppPageHeader';
import { demoFamily, demoTasteExplanations } from '@/lib/demo-data';

export const metadata = { title: 'Family Taste Memory' };

export default function FamilyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader emoji="🧠" title="Family Taste Memory" subtitle="Pantry Plus learns what each person eats — and personalizes every suggestion." gradient="from-pink-500 to-rose-600" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {demoFamily.map((m) => (
              <div key={m.name} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50 text-2xl dark:bg-pink-900/30">{m.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{m.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.diet}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {m.likes.length > 0 && <p><span className="text-accent-600 dark:text-accent-400">Likes:</span> <span className="text-gray-600 dark:text-gray-300">{m.likes.join(', ')}</span></p>}
                  {m.dislikes.length > 0 && <p><span className="text-amber-600 dark:text-amber-400">Dislikes:</span> <span className="text-gray-600 dark:text-gray-300">{m.dislikes.join(', ')}</span></p>}
                  {m.allergies.length > 0 && <p><span className="text-red-600 dark:text-red-400">Allergies:</span> <span className="font-semibold text-gray-700 dark:text-gray-200">{m.allergies.join(', ')}</span></p>}
                </div>
              </div>
            ))}
          </div>
          <Link href="/household/settings" className="inline-block text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Manage household members →
          </Link>
        </div>

        {/* How AI uses it */}
        <div className="rounded-2xl border border-primary-200 bg-primary-50/60 p-5 dark:border-primary-800 dark:bg-primary-900/20">
          <h2 className="font-bold text-gray-900 dark:text-white">How AI uses this</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Every suggestion respects your family’s tastes — and explains why.</p>
          <ul className="mt-4 space-y-3">
            {demoTasteExplanations.map((e) => (
              <li key={e} className="rounded-xl border border-white/60 bg-white/70 p-3 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300">“{e}”</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">Demo profiles — saving and editing will persist to your household.</p>
    </div>
  );
}
