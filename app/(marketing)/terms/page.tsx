import PageHero from '@/app/components/marketing/PageHero';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Terms of Service',
  path: '/terms',
  description: 'The terms governing your use of Pantry Plus — acceptable use, AI limitations, your responsibilities, subscriptions, disclaimers and termination.',
});

const sections = [
  {
    h: 'Acceptable use',
    p: 'You agree to use Pantry Plus lawfully and not to misuse the service — including not attempting to disrupt it, reverse-engineer it, abuse the AI features, or access data you are not authorized to access.',
  },
  {
    h: 'AI limitations',
    p: 'AI features generate suggestions (meal plans, recipes, substitutions, cost estimates, wellness information). These are automated, may be inaccurate or incomplete, and are not professional, medical, nutritional or financial advice. Always use your own judgement, especially regarding allergies and food safety.',
  },
  {
    h: 'Your responsibilities',
    p: 'You are responsible for the accuracy of the data you enter, for keeping your account credentials secure, and for how you use the suggestions the app provides. You are responsible for verifying expiry dates and food safety yourself.',
  },
  {
    h: 'Subscriptions',
    p: 'The core app is currently free. Paid Pro, Business and Enterprise plans are planned. When introduced, billing terms (price, renewal, cancellation, refunds) will be presented at the point of purchase and incorporated into these terms.',
  },
  {
    h: 'Disclaimer',
    p: 'The service is provided “as is” without warranties of any kind. To the maximum extent permitted by law, we are not liable for any loss arising from your use of the service, including food spoilage, dietary outcomes, or financial decisions made based on AI suggestions.',
  },
  {
    h: 'Termination',
    p: 'You may stop using the service and delete your data at any time. We may suspend or terminate accounts that violate these terms. On termination, you may export or delete your data subject to the Privacy Policy.',
  },
  {
    h: 'Changes',
    p: 'We may update these terms as the product evolves. Material changes will be communicated, and continued use after changes constitutes acceptance.',
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" subtitle="Last updated: June 2026" />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          This is a template for a student/early-stage product and is not legal advice. Have it
          reviewed before any commercial launch.
        </p>
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{s.h}</h2>
              <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-400">{s.p}</p>
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
