"use client";

import { useEffect, useState } from "react";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import {
  getStoredAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function AnalyticsProvider() {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConsent(getStoredAnalyticsConsent());
    setMounted(true);
  }, []);

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
