/**
 * Consistent header for in-app feature pages (autopilot, waste coach, etc.).
 * Server-safe presentational component.
 */
import { ReactNode } from 'react';

interface AppPageHeaderProps {
  emoji: string;
  title: string;
  subtitle?: string;
  gradient?: string;
  actions?: ReactNode;
}

export default function AppPageHeader({
  emoji,
  title,
  subtitle,
  gradient = 'from-primary-500 to-purple-600',
  actions,
}: AppPageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-md`}>
          {emoji}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
