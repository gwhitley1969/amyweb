import { siteConfig } from './siteConfig';

export type AnalyticsEvent =
  | 'book_click'
  | 'call_click'
  | 'skinbetter_click'
  | 'directions_click'
  | 'app_badge_click'
  | 'ma_site_click';

/** The self-hosted Plausible tracker (public/js/plausible.js) exposes
 * a queue-style global once loaded. Typed here so track() needs no
 * casts at call sites. */
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

/**
 * Vendor-neutral event tracking (BUILD_SPEC §11). Components call track();
 * the provider wiring lives only here so the vendor can change without
 * touching components. Plausible path wired 2026-08-17 (DECISIONS same
 * date) and gated behind siteConfig.analytics — while that ships dark
 * this stays a no-op, exactly as before.
 *
 * Honest scope note: as of 2026-08-17 NOTHING calls track() — the site
 * ships zero client-side component code, so pageviews (the tracker
 * script itself, emitted by BaseLayout) are the whole v1 signal. This
 * function is the ready seam for the first client-side consumer;
 * calling it from Astro frontmatter (server code) does nothing by
 * design (`window` guard).
 */
export function track(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>,
): void {
  if (!siteConfig.analytics.enabled) return;
  if (siteConfig.analytics.provider !== 'plausible') return;
  if (typeof window === 'undefined' || !window.plausible) return;
  window.plausible(event, props ? { props } : undefined);
}
