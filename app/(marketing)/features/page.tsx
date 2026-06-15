import PageHero from '@/app/components/marketing/PageHero';
import AIFeaturesSection from '@/app/components/marketing/AIFeaturesSection';
import FeatureGrid from '@/app/components/marketing/FeatureGrid';
import CTASection from '@/app/components/marketing/CTASection';
import SEOJsonLd, { breadcrumbSchema } from '@/app/components/marketing/SEOJsonLd';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Features',
  path: '/features',
  description:
    'Explore every Pantry Plus feature: Kitchen Autopilot, Food Waste Coach, AI meal planning, receipt scanning, household sharing, business recipe costing, and a full offline-first PWA.',
  keywords: ['AI kitchen assistant', 'kitchen inventory app', 'AI meal planner'],
});

export default function FeaturesPage() {
  return (
    <>
      <SEOJsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Features', path: '/features' }])} />
      <PageHero
        eyebrow="Features"
        title="Everything in your AI Kitchen OS"
        subtitle="From automated meal planning to small-business recipe costing — all in one offline-first app."
      />
      <AIFeaturesSection />
      <FeatureGrid title="All modules, included" subtitle="The complete toolkit for households and small food businesses." />
      <CTASection />
    </>
  );
}
