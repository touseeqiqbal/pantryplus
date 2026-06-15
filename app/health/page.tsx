/**
 * Health & wellness insights. Server component.
 * IMPORTANT: general wellness info only — NOT medical advice (disclaimer shown).
 *
 * TODO: connect to /api/insights/health for AI-personalized, inventory-aware tips.
 */
import AppPageHeader from '@/app/components/AppPageHeader';
import { demoFamily } from '@/lib/demo-data';

export const metadata = { title: 'Health & Wellness' };

const nutrition = [
  { label: 'Protein', value: 72, tone: 'bg-primary-500' },
  { label: 'Vegetables', value: 58, tone: 'bg-accent-500' },
  { label: 'Whole grains', value: 64, tone: 'bg-amber-500' },
  { label: 'Added sugar', value: 31, tone: 'bg-red-500', invert: true },
];

const healthyRecipes = [
  { name: 'Lentil & spinach stew', tag: 'High-fiber', emoji: '🥣' },
  { name: 'Grilled chicken bowl', tag: 'High-protein', emoji: '🥗' },
  { name: 'Veg & egg shakshuka', tag: 'Low-sugar', emoji: '🍳' },
  { name: 'Yogurt & fruit parfait', tag: 'Low-fat', emoji: '🍓' },
];

const awareness = [
  { label: 'Sugar', note: 'Trending lower this week — keep it up.', emoji: '🍬', tone: 'text-accent-600 dark:text-accent-400' },
  { label: 'Salt', note: 'Slightly high — watch processed items.', emoji: '🧂', tone: 'text-amber-600 dark:text-amber-400' },
  { label: 'Fat', note: 'Balanced for your goals.', emoji: '🥑', tone: 'text-accent-600 dark:text-accent-400' },
];

export default function HealthPage() {
  const allergies = Array.from(new Set(demoFamily.flatMap((m) => m.allergies)));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader emoji="💚" title="Health & Wellness" subtitle="Gentle, practical nutrition awareness for your household." gradient="from-emerald-500 to-green-600" />

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
        ⚕️ Pantry Plus provides general wellness information, not medical advice. Consult a professional for medical or dietary concerns.
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Nutrition balance */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <h2 className="font-bold text-gray-900 dark:text-white">Nutrition balance (this week)</h2>
          <div className="mt-4 space-y-3">
            {nutrition.map((n) => (
              <div key={n.label}>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400"><span>{n.label}</span><span>{n.value}%</span></div>
                <div className="mt-1 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className={`h-2 rounded-full ${n.tone}`} style={{ width: `${n.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allergy warnings */}
        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 dark:border-red-900/40 dark:bg-red-900/10">
          <h2 className="font-bold text-red-800 dark:text-red-300">Allergy watch</h2>
          {allergies.length > 0 ? (
            <>
              <p className="mt-1 text-xs text-red-700/80 dark:text-red-300/70">AI excludes these from every suggestion:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {allergies.map((a) => <span key={a} className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">⚠️ {a}</span>)}
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-red-700/80 dark:text-red-300/70">No allergies on file. Add them in Family Taste Memory.</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Awareness */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-bold text-gray-900 dark:text-white">Sugar · Salt · Fat awareness</h2>
          <ul className="mt-3 space-y-3">
            {awareness.map((a) => (
              <li key={a.label} className="flex items-start gap-3">
                <span className="text-2xl">{a.emoji}</span>
                <div><p className={`text-sm font-semibold ${a.tone}`}>{a.label}</p><p className="text-xs text-gray-500 dark:text-gray-400">{a.note}</p></div>
              </li>
            ))}
          </ul>
        </div>

        {/* Healthy recipes */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-bold text-gray-900 dark:text-white">Healthier picks from your kitchen</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {healthyRecipes.map((r) => (
              <li key={r.name} className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                <div className="text-2xl">{r.emoji}</div>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                <span className="text-xs text-accent-600 dark:text-accent-400">{r.tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
