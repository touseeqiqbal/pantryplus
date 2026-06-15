import PageHero from '@/app/components/marketing/PageHero';
import FAQSection from '@/app/components/marketing/FAQSection';
import CTASection from '@/app/components/marketing/CTASection';
import SEOJsonLd, { faqSchema, breadcrumbSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';
import { faqs } from '@/lib/marketing';

export const metadata = buildMetadata({
  title: 'FAQ',
  path: '/faq',
  description:
    'Answers about Pantry Plus: offline usage, AI features, privacy, household sharing, business mode, receipt scanning, data sync, and pricing.',
});

export default function FAQPage() {
  return (
    <>
      <SEOJsonLd
        data={[
          faqSchema(faqs),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]),
        ]}
      />
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        subtitle="Offline usage, AI, privacy, sharing, business mode, scanning, sync and pricing."
      />
      <FAQSection title="" />
      <CTASection title="Still have questions?" subtitle="We’re happy to help — reach out any time." primaryLabel="Contact Us" primaryHref="/contact" secondaryLabel="Read the Help Center" secondaryHref="/help" />
    </>
  );
}
