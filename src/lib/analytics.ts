import { siteConfig } from './siteConfig';

export type AnalyticsEvent =
  | 'book_click'
  | 'call_click'
  | 'skinbetter_click'
  | 'directions_click'
  | 'app_badge_click';

/**
 * Vendor-neutral event tracking (BUILD_SPEC §11). Components call track();
 * the provider wiring lives only here so the vendor can change without
 * touching components. No-op until {{ANALYTICS_PROVIDER}} is confirmed.
 */
export function track(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>,
): void {
  if (!siteConfig.analytics.enabled) return;
  void event;
  void props;
}
