import type { Metadata } from "next";
import Link from "next/link";
import { env, getEnvironmentStatuses } from "@/lib/env";

export const metadata: Metadata = {
  title: "Admin Setup",
  description: "Verifica la configurazione locale e production di BizKit AI.",
  robots: {
    index: false,
    follow: false,
  },
};

function SetupBadge({ configured }: { configured: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        configured
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      {configured ? "Configurato" : "Mancante"}
    </span>
  );
}

export default function AdminSetupPage() {
  const statuses = getEnvironmentStatuses();
  const setupItems = [
    { key: "stripe", label: "Stripe Checkout" },
    { key: "stripeSubscriptions", label: "Stripe Subscriptions" },
    { key: "stripeWebhook", label: "Stripe Webhook" },
    { key: "supabase", label: "Supabase" },
    { key: "supabaseAdmin", label: "Supabase Service Role" },
    { key: "openai", label: "OpenAI" },
    { key: "resend", label: "Resend" },
    { key: "analytics", label: "Analytics" },
    { key: "admin", label: "Admin Password" },
  ] as const;

  return (
    <section className="section-shell pt-12 sm:pt-16">
      <div className="container-shell space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
          <span className="eyebrow">Setup status</span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Stato configurazione BizKit AI
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Questa pagina controlla in tempo reale i servizi esterni necessari per login,
            dashboard, pagamenti, AI, email e deploy. Se qualcosa manca, il progetto continua a
            funzionare mostrando messaggi chiari invece di andare in crash.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">URL applicazione</p>
              <p className="mt-2 font-semibold text-slate-950">{env.appUrl}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Ambiente</p>
              <p className="mt-2 font-semibold text-slate-950">{process.env.NODE_ENV}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Guida rapida</p>
              <Link href="/admin/login" className="mt-2 inline-block font-semibold text-blue-700">
                Vai a login admin
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {setupItems.map((item) => {
            const status = statuses[item.key];

            return (
              <div key={item.key} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">{item.label}</h2>
                    <p className="mt-3 leading-7 text-slate-600">{status.description}</p>
                  </div>
                  <SetupBadge configured={status.configured} />
                </div>
                {!status.configured ? (
                  <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
                    <p className="font-semibold">Variabili mancanti</p>
                    <p className="mt-2">{status.missing.join(", ") || "Controlla la configurazione."}</p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                    Configurazione presente. Questo blocco del prodotto puo essere attivato.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">Prossimi step</h2>
          <div className="mt-5 grid gap-3 text-sm leading-7 text-slate-600">
            <p>1. Copia `.env.example` in `.env.local`.</p>
            <p>2. Completa Stripe, Supabase, OpenAI e Resend.</p>
            <p>3. Applica `supabase/schema.sql` o la migration in Supabase.</p>
            <p>4. Esegui `npm run check:env`, poi `npm run lint`, `npm run typecheck` e `npm run build`.</p>
            <p>5. Configura le stesse variabili su Vercel per Preview e Production.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
