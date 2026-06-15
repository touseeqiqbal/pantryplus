/**
 * Unified Scan Hub — receipt, item photo, barcode, and shelf-image scanning.
 * Server component routing into the existing scan flows.
 *
 * Wires to existing capabilities:
 *  - Receipt scanning  → /expenses (uses /api/expenses/scan)
 *  - Item photo / barcode / shelf → /inventory (uses /api/vision + barcode)
 */
import Link from 'next/link';
import AppPageHeader from '@/app/components/AppPageHeader';

const tiles = [
  { emoji: '🧾', title: 'Scan a receipt', desc: 'Turn a grocery receipt into inventory + an expense entry automatically.', href: '/expenses?scan=true', tone: 'from-sky-500 to-blue-600', live: true },
  { emoji: '📷', title: 'Scan a pantry item', desc: 'Snap a photo and AI identifies the item to add to inventory.', href: '/inventory?scan=photo', tone: 'from-indigo-500 to-purple-600', live: true },
  { emoji: '🔖', title: 'Scan a barcode', desc: 'Point your camera at a barcode for instant item details.', href: '/inventory?scan=barcode', tone: 'from-violet-500 to-fuchsia-600', live: true },
  { emoji: '🗄️', title: 'Scan a whole shelf', desc: 'Upload a photo of your shelf or fridge to bulk-add items.', href: '/inventory?scan=shelf', tone: 'from-emerald-500 to-teal-600', live: false },
];

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:pb-10">
      <AppPageHeader emoji="🧾" title="Smart Scan Hub" subtitle="Snap a receipt, item, barcode, or shelf — AI turns it into inventory." gradient="from-sky-500 to-blue-600" />

      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map((t) => (
          <Link
            key={t.title}
            href={t.href}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${t.tone} text-2xl shadow-md`}>{t.emoji}</div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              {t.title}
              {!t.live && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">Soon</span>}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t.desc}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-primary-600 group-hover:translate-x-1 dark:text-primary-400">Open →</span>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        Receipt &amp; photo scanning use the existing AI vision routes. Shelf bulk-scan is on the roadmap.
      </p>
    </div>
  );
}
