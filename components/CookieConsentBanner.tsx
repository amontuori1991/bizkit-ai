"use client";

import { useEffect, useState } from "react";
import {
  getStoredAnalyticsConsent,
  setStoredAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics";

type CookieConsentBannerProps = {
  onConsentChange: (value: AnalyticsConsent) => void;
};

export function CookieConsentBanner({ onConsentChange }: CookieConsentBannerProps) {
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);

  useEffect(() => {
    const stored = getStoredAnalyticsConsent();
    setConsent(stored);
    setMounted(true);
  }, []);

  function updateConsent(value: AnalyticsConsent) {
    setStoredAnalyticsConsent(value);
    setConsent(value);
    onConsentChange(value);
  }

  if (!mounted || consent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Cookie consent
          </p>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Usiamo analytics per misurare visite, lead, checkout e download del kit. I tool
            vengono attivati solo con il tuo consenso.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => updateConsent("denied")} className="button-secondary">
            Rifiuta
          </button>
          <button type="button" onClick={() => updateConsent("granted")} className="button-primary">
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
