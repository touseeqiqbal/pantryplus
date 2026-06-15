import PageHero from '@/app/components/marketing/PageHero';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  path: '/privacy',
  description: 'How Pantry Plus collects, uses, stores and protects your account, pantry, household and AI data — and how to delete it.',
});

const sections = [
  {
    h: 'Account data',
    p: 'When you create an account we store your email address and authentication identifiers (via Firebase Authentication). We use this only to sign you in, secure your account, and associate your data with you.',
  },
  {
    h: 'Pantry & kitchen data',
    p: 'Inventory items, expiry dates, meals, recipes, shopping lists, tasks and expenses you create are stored locally on your device (IndexedDB) and synced to your private cloud database (Firestore). This data is tied to your account and household and is not shared publicly.',
  },
  {
    h: 'Household data',
    p: 'If you join or create a household, your shared inventory, meals, tasks and expenses are visible to other members of that household, according to their role. You control who you invite.',
  },
  {
    h: 'AI requests',
    p: 'When you use AI features (assistant, meal planning, waste coach, receipt scanning), the relevant context (e.g. inventory items, your prompt, or a receipt image) is sent to our AI provider to generate a response. We do not sell this data, and we do not use it to build advertising profiles. AI suggestions are generated on demand to help you — nothing more.',
  },
  {
    h: 'Analytics',
    p: 'We may collect anonymous, aggregated usage events (for example, that a meal plan was generated) to understand which features are useful and improve the product. Analytics are privacy-respecting and do not identify you personally.',
  },
  {
    h: 'Data retention & deletion',
    p: 'Your data is retained while your account is active. You can delete individual items at any time, and you can permanently delete all of your data from Settings → Data Management, which removes it from both your device and the cloud.',
  },
  {
    h: 'Security',
    p: 'Access to your data is enforced by server-side security rules: only you and the household/business members you authorize can read or write your data. Connections are encrypted in transit.',
  },
  {
    h: 'Contact',
    p: 'For privacy questions or data requests, contact us via the Contact page. We will respond promptly.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" subtitle="Last updated: June 2026" />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          This is a template privacy policy for a student/early-stage product. Before a commercial
          launch, have it reviewed to ensure it meets the laws applicable to your users (e.g. GDPR).
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
