/**
 * Layout for all public marketing pages.
 * Wraps content with the marketing navbar + footer. Nests inside the root
 * layout (which provides global providers). Pages here are public (no auth).
 */
import { ReactNode } from 'react';
import MarketingNavbar from '@/app/components/marketing/MarketingNavbar';
import MarketingFooter from '@/app/components/marketing/MarketingFooter';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
