"use client";

import { isSaasAnalyticsEventName, type SaasAnalyticsEventName } from "@/lib/analytics-events";

export const ANALYTICS_CONSENT_KEY = "bizkit-ai-analytics-consent";

export type AnalyticsConsent = "granted" | "denied";

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
};

export type TrackEventValue =
  | string
  | number
  | boolean
  | string[]
  | AnalyticsItem[]
  | undefined;

export type TrackEventParams = Record<string, TrackEventValue>;

type TrackEventOptions = {
  logToServer?: boolean;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function queueServerAnalyticsEvent(eventName: SaasAnalyticsEventName) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        source: "client",
      }),
      keepalive: true,
    });
  } catch {
    // Best effort only.
  }
}

export function getStoredAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function setStoredAnalyticsConsent(value: AnalyticsConsent) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  document.cookie = `analytics_consent=${value}; path=/; max-age=${60 * 60 * 24 * 180}; SameSite=Lax`;
}

export function analyticsEnabled() {
  return getStoredAnalyticsConsent() === "granted";
}

export function trackPageView(url?: string) {
  if (typeof window === "undefined" || !analyticsEnabled()) {
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: url ?? window.location.href,
      page_path: window.location.pathname + window.location.search,
    });
  }
}

export function trackEvent(
  eventName: string,
  params: TrackEventParams = {},
  options: TrackEventOptions = {},
) {
  if (typeof window === "undefined" || !analyticsEnabled()) {
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }

  if (options.logToServer !== false && isSaasAnalyticsEventName(eventName)) {
    queueServerAnalyticsEvent(eventName);
  }
}

export function trackMetaEvent(eventName: string, params: TrackEventParams = {}) {
  if (typeof window === "undefined" || !analyticsEnabled()) {
    return;
  }

  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, params);
  }
}

export function trackViewProduct(params: {
  itemId: string;
  itemName: string;
  category: string;
  price: number;
  currency?: string;
}) {
  const currency = params.currency ?? "EUR";
  const items: AnalyticsItem[] = [
    {
      item_id: params.itemId,
      item_name: params.itemName,
      item_category: params.category,
      price: params.price,
      quantity: 1,
    },
  ];

  trackEvent("view_item", {
    currency,
    value: params.price,
    items,
  });

  trackMetaEvent("ViewContent", {
    content_name: params.itemName,
    content_category: params.category,
    content_ids: [params.itemId],
    content_type: "product",
    currency,
    value: params.price,
  });
}

export function trackStartCheckout(params: {
  itemId: string;
  itemName: string;
  category: string;
  price: number;
  currency?: string;
}) {
  const currency = params.currency ?? "EUR";
  const items: AnalyticsItem[] = [
    {
      item_id: params.itemId,
      item_name: params.itemName,
      item_category: params.category,
      price: params.price,
      quantity: 1,
    },
  ];

  trackEvent("begin_checkout", {
    currency,
    value: params.price,
    items,
  });

  trackMetaEvent("InitiateCheckout", {
    content_name: params.itemName,
    content_ids: [params.itemId],
    content_type: "product",
    currency,
    value: params.price,
  });
}

export function trackPurchase(params: {
  transactionId: string;
  itemId: string;
  itemName: string;
  category: string;
  price: number;
  currency?: string;
}) {
  const currency = params.currency ?? "EUR";
  const items: AnalyticsItem[] = [
    {
      item_id: params.itemId,
      item_name: params.itemName,
      item_category: params.category,
      price: params.price,
      quantity: 1,
    },
  ];

  trackEvent("purchase", {
    transaction_id: params.transactionId,
    currency,
    value: params.price,
    items,
  });

  trackMetaEvent("Purchase", {
    content_name: params.itemName,
    content_ids: [params.itemId],
    content_type: "product",
    currency,
    value: params.price,
  });
}

export function trackDownload(params: {
  itemId: string;
  itemName: string;
  assetName: string;
}) {
  trackEvent("download", {
    item_id: params.itemId,
    item_name: params.itemName,
    asset_name: params.assetName,
  });

  trackMetaEvent("Download", {
    content_name: params.itemName,
    content_ids: [params.itemId],
    asset_name: params.assetName,
  });
}

export function trackLeadSignup(params: { source: string; asset: string }) {
  trackEvent("generate_lead", {
    method: "popup",
    source: params.source,
    asset: params.asset,
  });

  trackMetaEvent("Lead", {
    source: params.source,
    asset: params.asset,
  });
}
