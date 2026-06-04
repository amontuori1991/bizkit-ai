import type { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { plans, planMatrix } from "@/data/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Confronta i piani Starter, Pro e Agency di BizKit AI con feature matrix, CTA forti e pricing pronto per Stripe subscriptions su fitness, hair e sport & outdoor.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <section className="section-shell pt-12 sm:pt-20">
        <div className="container-shell">
          <div className="mx-auto max-w-4xl text-center">
            <span className="eyebrow">Pricing</span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Piani chiari per far crescere il tuo workflow AI
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Scegli un piano pensato per contenuti, promo e CRM locali. Ogni tier include output
              AI in 3 varianti, Business Profile intelligente, Social Calendar Generator,
              generatori Reel e messaggi clienti per palestre, saloni parrucchieri e centri sportivi/outdoor.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="button-primary">
                Inizia gratis
              </Link>
              <Link href="/demo" className="button-secondary">
                Prova la demo
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative overflow-hidden rounded-[2rem] border p-8 shadow-soft ${
                  plan.highlight
                    ? "border-blue-500 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-950"
                }`}
              >
                {plan.highlight ? (
                  <span className="absolute right-5 top-5 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                ) : null}
                <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${plan.highlight ? "text-blue-200" : "text-blue-600"}`}>
                  {plan.badge}
                </p>
                <h2 className="mt-4 text-3xl font-bold">{plan.name}</h2>
                <p className={`mt-3 text-5xl font-bold ${plan.highlight ? "text-white" : "text-slate-950"}`}>
                  {plan.priceMonthlyValue}
                  <span className={`ml-2 text-lg font-medium ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}>EUR/mese</span>
                </p>
                <p className={`mt-3 text-sm ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}>{plan.audience}</p>
                <p className={`mt-4 leading-7 ${plan.highlight ? "text-slate-200" : "text-slate-600"}`}>{plan.description}</p>
                <div className={`mt-5 rounded-[1.5rem] px-4 py-4 ${plan.highlight ? "bg-white/10" : "bg-slate-50"}`}>
                  <p className={`text-sm font-semibold ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.usageLimitLabel}</p>
                  <p className={`mt-1 text-sm ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}>{plan.seats}</p>
                </div>
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
                <Link
                  href={plan.highlight ? "/dashboard/billing" : "/signup"}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    plan.highlight
                      ? "bg-white text-slate-950 hover:bg-slate-100"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {plan.ctaLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell">
          <div className="mb-10 space-y-3">
            <span className="eyebrow">Feature matrix</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Confronto rapido tra i piani
            </h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
            <div className="grid grid-cols-[1.3fr_repeat(3,minmax(0,1fr))] border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
              <div className="px-4 py-4 sm:px-6">Funzione</div>
              {plans.map((plan) => (
                <div key={plan.id} className="px-4 py-4 text-center sm:px-6">
                  {plan.name}
                </div>
              ))}
            </div>
            {planMatrix.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.3fr_repeat(3,minmax(0,1fr))] border-b border-slate-100 text-sm last:border-b-0"
              >
                <div className="px-4 py-4 font-semibold text-slate-900 sm:px-6">{row.label}</div>
                <div className="px-4 py-4 text-center text-slate-600 sm:px-6">{row.values.starter}</div>
                <div className="px-4 py-4 text-center text-slate-600 sm:px-6">{row.values.pro}</div>
                <div className="px-4 py-4 text-center text-slate-600 sm:px-6">{row.values.agency}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Vuoi provare il valore prima di attivare un piano?"
        description="Apri la demo gratuita, sblocca una generazione senza login e poi passa alla dashboard per CRM, salvataggi e storico completo."
        primaryCta={{ href: "/demo", label: "Apri la demo gratuita" }}
        secondaryCta={{ href: "/signup", label: "Crea account" }}
      />
    </>
  );
}
