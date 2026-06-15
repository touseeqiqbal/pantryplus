import PageHero from '@/app/components/marketing/PageHero';
import CTASection from '@/app/components/marketing/CTASection';
import SEOJsonLd, { breadcrumbSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';
import { roadmap } from '@/lib/marketing';

export const metadata = buildMetadata({
  title: 'Roadmap',
  path: '/roadmap',
  description: 'The Pantry Plus product roadmap — from MVP to AI expansion, business mode, mobile optimization, monetization and enterprise features.',
});

const statusStyles: Record<string, { label: string; cls: string; dot: string }> = {
  done: { label: 'Shipped', cls: 'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300', dot: 'bg-accent-500' },
  'in-progress': { label: 'In progress', cls: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300', dot: 'bg-primary-500 animate-pulse' },
  planned: { label: 'Planned', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300', dot: 'bg-gray-400' },
};

export default function RoadmapPage() {
  return (
    <>
      <SEOJsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Roadmap', path: '/roadmap' }])} />
      <PageHero
        eyebrow="Roadmap"
        title="Where Pantry Plus is headed"
        subtitle="From a university MVP to a launch-ready AI Kitchen Operating System."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ol className="relative space-y-8 border-l-2 border-gray-200 pl-8 dark:border-gray-800">
          {roadmap.map((phase) => {
            const s = statusStyles[phase.status];
            return (
              <li key={phase.phase} className="relative">
                <span className={`absolute -left-[2.55rem] mt-1.5 h-4 w-4 rounded-full ring-4 ring-white dark:ring-gray-900 ${s.dot}`} />
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-400">{phase.phase}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                </div>
                <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{phase.title}</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {phase.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-primary-500">•</span>
                      {it}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      <CTASection />
    </>
  );
}
