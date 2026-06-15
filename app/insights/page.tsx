/**
 * Insights — analytics dashboard + Pantry Score (gamification).
 * Server component rendering demo analytics.
 *
 * TODO: compute these from real expenses, inventory, waste and meal-plan data.
 */
import AppPageHeader from '@/app/components/AppPageHeader';
import { demoInsights, demoPantryScore } from '@/lib/demo-data';

export const metadata = { title: 'Insights' };

export default function InsightsPage() {
  const maxSpend = Math.max(...demoInsights.spendTrend);
  const score = demoPantryScore.score;
  const ringCircumference = 2 * Math.PI * 42;
  const dash = (score / 100) * ringCircumference;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader emoji="🏆" title="Insights & Pantry Score" subtitle="Your kitchen, measured — waste saved, spending and habits." gradient="from-cyan-500 to-emerald-600" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pantry Score */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-bold text-gray-900 dark:text-white">Pantry Score</h2>
          <div className="relative mx-auto mt-4 h-32 w-32">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-gray-200 dark:stroke-gray-700" />
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${ringCircumference}`} className="stroke-accent-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{score}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-left">
            {demoPantryScore.breakdown.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400"><span>{b.label}</span><span>{b.value}</span></div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${b.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {demoPantryScore.badges.map((b) => (
              <span key={b.name} className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{b.emoji} {b.name}</span>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Waste saved', value: `$${demoInsights.wasteSaved.toFixed(0)}`, tone: 'text-accent-600 dark:text-accent-400' },
              { label: 'Budget used', value: `${demoInsights.budgetUsedPct}%`, tone: 'text-gray-900 dark:text-white' },
              { label: 'Plan completion', value: `${demoInsights.mealPlanCompletionPct}%`, tone: 'text-primary-600 dark:text-primary-400' },
              { label: 'Top item', value: demoInsights.topIngredients[0], tone: 'text-gray-900 dark:text-white' },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className={`truncate text-xl font-extrabold ${c.tone}`}>{c.value}</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Spend trend */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-bold text-gray-900 dark:text-white">Grocery spending trend</h2>
            <div className="mt-4 flex h-40 items-end justify-between gap-2">
              {demoInsights.spendTrend.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end" style={{ height: '8rem' }}>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-primary-600 to-primary-400" style={{ height: `${(v / maxSpend) * 100}%` }} title={`$${v}`} />
                  </div>
                  <span className="text-[10px] text-gray-400">{demoInsights.spendMonths[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-2xl border border-primary-200 bg-primary-50/60 p-5 dark:border-primary-800 dark:bg-primary-900/20">
            <h2 className="font-bold text-gray-900 dark:text-white">AI recommendations</h2>
            <ul className="mt-3 space-y-2">
              {demoInsights.recommendations.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><span>💡</span> {r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">Demo analytics — these will compute from your real expenses, inventory and waste data.</p>
    </div>
  );
}
