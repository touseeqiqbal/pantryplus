import HeroSection from '@/app/components/marketing/HeroSection';
import ProblemSolutionSection from '@/app/components/marketing/ProblemSolutionSection';
import AIFeaturesSection from '@/app/components/marketing/AIFeaturesSection';
import FeatureGrid from '@/app/components/marketing/FeatureGrid';
import PricingCards from '@/app/components/marketing/PricingCards';
import TestimonialsSection from '@/app/components/marketing/TestimonialsSection';
import FAQSection from '@/app/components/marketing/FAQSection';
import CTASection from '@/app/components/marketing/CTASection';
import SEOJsonLd, { organizationSchema, softwareAppSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  path: '/',
  description:
    'Pantry Plus is the AI Kitchen Operating System for homes, families and small food businesses. Automate meals, cut food waste, save grocery money — online or offline.',
});

export default function HomePage() {
  return (
    <>
      <SEOJsonLd data={[organizationSchema(), softwareAppSchema()]} />
      <HeroSection />
      <ProblemSolutionSection />
      <AIFeaturesSection />
      <FeatureGrid limit={8} />
      <PricingCards
        title="Start free. Scale to a business."
        subtitle="The core app is free forever. Pro and Business plans add the AI that runs your kitchen."
      />
      <TestimonialsSection />
      <FAQSection limit={6} subtitle="Everything you need to know about Pantry Plus." />
      <CTASection />
    </>
  );
}
