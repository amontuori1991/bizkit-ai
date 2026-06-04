"use client";

import { useState } from "react";
import type { Plan } from "@/data/plans";
import { type PlanUsageSummary, formatUsageShort } from "@/lib/plan-limits";

type BillingPlansProps = {
  plans: Plan[];
  enabled?: boolean;
  disabledMessage?: string;
  currentPlanId?: string;
  usageSummary?: PlanUsageSummary;
};

export function BillingPlans({
  plans,
  enabled = true,
  disabledMessage,
  currentPlanId,
  usageSummary,
}: BillingPlansProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubscribe(planId: string) {
    setLoadingPlan(planId);
    setErrorMessage(null);

    try {
      if (!enabled) {
        throw new Error(
          disabledMessage || "Stripe subscriptions non e configurato. Il billing e disattivato.",
        );
      }

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout subscription non disponibile.");
      }

      window.location.href = data.url;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante il billing.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;
          const hasTopBadges = plan.highlight || isCurrentPlan;

          return (
            <div
              key={plan.id}
              className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-soft ${
              plan.highlight
                ? "border-blue-500 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-950"
            } ${hasTopBadges ? "pt-16" : ""}`}
            >
              {hasTopBadges ? (
                <div className="absolute inset-x-5 top-5 flex flex-wrap items-center justify-between gap-2">
                  {isCurrentPlan ? (
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      Piano attuale
                    </span>
                  ) : (
                    <span />
                  )}
                  {plan.highlight ? (
                    <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                      Most popular
                    </span>
                  ) : null}
                </div>
              ) : null}
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${plan.highlight ? "text-blue-200" : "text-blue-500"}`}>
              {plan.badge}
            </p>
            <h3 className="mt-4 text-3xl font-bold">{plan.name}</h3>
            <p className={`mt-4 text-4xl font-bold ${plan.highlight ? "text-white" : "text-slate-950"}`}>{plan.priceLabel}</p>
            <p className={`mt-2 text-sm ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}>{plan.audience}</p>
            <p className={`mt-4 leading-7 ${plan.highlight ? "text-slate-200" : "text-slate-600"}`}>{plan.description}</p>
            <div className={`mt-5 rounded-[1.5rem] px-4 py-4 ${plan.highlight ? "bg-white/10" : "bg-slate-50"}`}>
              <p className={`text-sm font-semibold ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.usageLimitLabel}</p>
              <p className={`mt-1 text-sm ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}>{plan.seats}</p>
            </div>
            {usageSummary && currentPlanId === plan.id ? (
              <div className={`mt-5 rounded-[1.5rem] border px-4 py-4 text-sm ${plan.highlight ? "border-white/10 bg-white/5 text-slate-100" : "border-slate-200 bg-white text-slate-700"}`}>
                <p className="font-semibold">Utilizzo attuale</p>
                <div className="mt-3 grid gap-2">
                  <p>Crediti AI: {formatUsageShort(usageSummary.progress.aiCreditsToday)}</p>
                  <p>Coach: {formatUsageShort(usageSummary.progress.coachMessagesMonth)}</p>
                  <p>Contenuti salvati: {formatUsageShort(usageSummary.progress.savedContents)}</p>
                  <p>Calendari: {formatUsageShort(usageSummary.progress.calendars)}</p>
                  <p>Clienti CRM: {formatUsageShort(usageSummary.progress.crmClients)}</p>
                  <p>Business profile: {formatUsageShort(usageSummary.progress.businessProfiles)}</p>
                </div>
              </div>
            ) : null}
            <div className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    plan.highlight
                      ? "border border-white/10 bg-white/5 text-slate-100"
                      : "border border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {feature}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan === plan.id || !enabled}
              className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                plan.highlight
                  ? "bg-white text-slate-950 hover:bg-slate-100"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {!enabled
                ? "Billing non disponibile"
                : loadingPlan === plan.id
                  ? "Apertura checkout..."
                  : plan.ctaLabel}
            </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
