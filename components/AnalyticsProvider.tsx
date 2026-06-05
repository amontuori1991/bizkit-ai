"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import {
  getStoredAnalyticsConsent,
  trackPageView,
  type AnalyticsConsent,
} from "@/lib/analytics";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConsent(getStoredAnalyticsConsent());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || consent !== "granted") {
      return;
    }

    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    trackPageView(url);
  }, [consent, mounted, pathname, searchParams]);

  return (
    <>
      <AnalyticsScripts
        gaMeasurementId={gaMeasurementId}
        metaPixelId={metaPixelId}
        enabled={mounted && consent === "granted"}
      />
      <CookieConsentBanner onConsentChange={setConsent} />
    </>
  );
}
