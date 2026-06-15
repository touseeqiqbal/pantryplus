/**
 * ErrorState — consistent error display with optional retry action.
 * Server-safe; pass an interactive `action` (e.g. a client "Try again" button).
 */
import { ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  action,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-900/20 px-6 py-12 text-center ${className}`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300">
        <ExclamationTriangleIcon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-red-800 dark:text-red-200">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-red-600/80 dark:text-red-300/80">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
