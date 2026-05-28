"use client";

import { useState } from "react";
import type { Plan } from "@/data/plans";

type BillingPlansProps = {
  plans: Plan[];
  enabled?: boolean;
  disabledMessage?: string;
};

export function BillingPlans({ plans, enabled = true, disabledMessage }: BillingPlansProps) {
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
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">
              {plan.name}
            </p>
            <p className="mt-4 text-4xl font-bold text-slate-950">{plan.priceLabel}</p>
            <p className="mt-2 text-sm text-slate-500">{plan.seats}</p>
            <p className="mt-4 leading-7 text-slate-600">{plan.description}</p>
            <div className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {feature}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan === plan.id || !enabled}
              className="button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              {!enabled
                ? "Billing non disponibile"
                : loadingPlan === plan.id
                  ? "Apertura checkout..."
                  : `Scegli ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
