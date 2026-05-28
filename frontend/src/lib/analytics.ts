/**
 * Umami Analytics — lightweight event tracking helper.
 *
 * Umami auto-tracks page views. This file handles custom events
 * so we can measure specific user actions (searches, favorites, etc.).
 *
 * The `umami` global is injected by the script tag in layout.tsx.
 * If it's blocked (ad-blocker) or hasn't loaded, calls are silently ignored.
 */

// Extend Window to include Umami's global
declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, string | number>) => void;
    };
  }
}

/**
 * Track a custom event. Safe to call even if Umami isn't loaded.
 */
export function trackEvent(
  event: string,
  data?: Record<string, string | number>
) {
  try {
    window.umami?.track(event, data);
  } catch {
    // Silently ignore — analytics should never break the app
  }
}

// ── Pre-defined event helpers ──

export const analytics = {
  /** User searched stop-to-stop */
  searchRoute: (from: string, to: string) =>
    trackEvent("search_route", { from, to }),

  /** User searched by bus number */
  searchBus: (busNumber: string) =>
    trackEvent("search_bus", { bus: busNumber }),

  /** User looked up a specific stop */
  searchStop: (stopName: string) =>
    trackEvent("search_stop", { stop: stopName }),

  /** User added a favorite */
  addFavorite: (type: "route" | "stop") =>
    trackEvent("add_favorite", { type }),

  /** User signed up */
  signup: () => trackEvent("signup"),

  /** User logged in */
  login: (method: "email" | "google") =>
    trackEvent("login", { method }),
};
