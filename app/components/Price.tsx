'use client';

/**
 * Renders an amount in the user's selected country currency.
 * A client component so it can be dropped into server components too — they
 * can't call the useCountry() hook directly, but they can render <Price />.
 */
import { useCountry } from '@/lib/hooks/useCountry';

export default function Price({ value, className }: { value: number; className?: string }) {
  const { formatPrice } = useCountry();
  return <span className={className}>{formatPrice(value)}</span>;
}
