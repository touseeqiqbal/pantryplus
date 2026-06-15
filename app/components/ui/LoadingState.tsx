/**
 * LoadingState — consistent loading spinner for pages, cards, and sections.
 * Server-safe (no hooks) so it can be used anywhere.
 */
interface LoadingStateProps {
  label?: string;
  /** 'page' fills the viewport; 'section' fits inside a card/section. */
  variant?: 'page' | 'section' | 'inline';
  className?: string;
}

export default function LoadingState({
  label = 'Loading…',
  variant = 'section',
  className = '',
}: LoadingStateProps) {
  const wrapper =
    variant === 'page'
      ? 'min-h-[60vh] flex items-center justify-center'
      : variant === 'inline'
        ? 'inline-flex items-center gap-2'
        : 'py-12 flex items-center justify-center';

  return (
    <div className={`${wrapper} ${className}`} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400" />
        {label && <span className="text-sm font-medium">{label}</span>}
      </div>
    </div>
  );
}
