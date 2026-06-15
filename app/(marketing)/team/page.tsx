import PageHero from '@/app/components/marketing/PageHero';
import CTASection from '@/app/components/marketing/CTASection';
import SEOJsonLd, { breadcrumbSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';
import { team } from '@/lib/marketing';

export const metadata = buildMetadata({
  title: 'Team',
  path: '/team',
  description: 'The team behind Pantry Plus — product, frontend, backend, AI/ML and QA, building an AI-powered offline-first kitchen management system.',
});

export default function TeamPage() {
  return (
    <>
      <SEOJsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Team', path: '/team' }])} />
      <PageHero
        eyebrow="Our team"
        title="The people building Pantry Plus"
        subtitle="A focused final-year project team spanning product, engineering, AI and quality."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <div key={m.name} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-purple-100 text-4xl dark:from-primary-900/40 dark:to-purple-900/40">
                {m.emoji}
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{m.name}</h3>
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{m.role}</p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{m.bio}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Placeholder profiles — replace names and photos with your real team details.
        </p>
      </section>

      <CTASection title="Want to follow our progress?" subtitle="See where Pantry Plus is headed next." primaryLabel="View Roadmap" primaryHref="/roadmap" secondaryLabel="Read the Blog" secondaryHref="/blog" />
    </>
  );
}
