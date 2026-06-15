import PageHero from '@/app/components/marketing/PageHero';
import PricingCards from '@/app/components/marketing/PricingCards';
import FAQSection from '@/app/components/marketing/FAQSection';
import CTASection from '@/app/components/marketing/CTASection';
import SEOJsonLd, { breadcrumbSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';
import { faqs } from '@/lib/marketing';

export const metadata = buildMetadata({
  title: 'Pricing',
  path: '/pricing',
  description:
    'Pantry Plus pricing — Free forever for households, Pro for AI-powered families, Business for food sellers, and Enterprise for multi-location operators.',
  keywords: ['grocery budget app', 'pantry management app pricing'],
});

const pricingFaqs = faqs.filter((f) => ['Pricing', 'Business', 'AI'].includes(f.category || ''));

export default function PricingPage() {
  return (
    <>
      <SEOJsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }])} />
      <PageHero
        eyebrow="Pricing"
        title="Pricing that scales from student to startup"
        subtitle="Start free. Upgrade when you want the AI to run your kitchen. Business plans for food sellers."
      />
      <PricingCards withHeading={false} />
      <FAQSection items={pricingFaqs} title="Pricing questions" />
      <CTASection title="Try it free — no card required" />
    </>
  );
}
