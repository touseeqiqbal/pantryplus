import { EnvelopeIcon, ChatBubbleLeftRightIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import PageHero from '@/app/components/marketing/PageHero';
import ContactForm from '@/app/components/marketing/ContactForm';
import SEOJsonLd, { breadcrumbSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Contact',
  path: '/contact',
  description: 'Get in touch with the Pantry Plus team — questions, business plan early access, partnerships and support.',
});

const channels = [
  { icon: ChatBubbleLeftRightIcon, title: 'General questions', text: 'Product questions, feedback, or anything else.' },
  { icon: BuildingStorefrontIcon, title: 'Business early access', text: 'Home bakers, tiffin services, cafés & cloud kitchens.' },
  { icon: EnvelopeIcon, title: 'Partnerships', text: 'Integrations, suppliers and collaboration ideas.' },
];

export default function ContactPage() {
  return (
    <>
      <SEOJsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])} />
      <PageHero
        eyebrow="Contact"
        title="Let’s talk"
        subtitle="Questions, early access, or partnership ideas — we’d love to hear from you."
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="space-y-5">
              {channels.map((c) => (
                <div key={c.title} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{c.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
