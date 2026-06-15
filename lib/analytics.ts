/**
 * Provider-agnostic analytics abstraction.
 *
 * Call `track('event_name', { ...props })` anywhere. By default it's a no-op in
 * production and logs in development. To wire a real provider (GA4, PostHog,
 * Plausible, Vercel Analytics, etc.) implement `dispatch()` below — nothing
 * else in the app needs to change.
 */

export type AnalyticsEvent =
  | 'sign_up'
  | 'sign_in'
  | 'inventory_item_added'
  | 'meal_plan_generated'
  | 'ai_chat_used'
  | 'receipt_scanned'
  | 'shopping_list_created'
  | 'business_costing_used'
  | 'waste_coach_viewed'
  | 'budget_plan_generated'
  | 'contact_submitted'
  | 'pricing_cta_clicked';

type Props = Record<string, string | number | boolean | null | undefined>;

function dispatch(event: AnalyticsEvent, props?: Props) {
  // TODO: integrate a real analytics provider here, e.g.:
  //   window.gtag?.('event', event, props);
  //   posthog?.capture(event, props);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${event}`, props ?? {});
  }
}

export function track(event: AnalyticsEvent, props?: Props): void {
  try {
    dispatch(event, props);
  } catch {
    // Analytics must never break the app.
  }
}
