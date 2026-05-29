import { BillingPlans } from "@/components/dashboard/BillingPlans";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { plans } from "@/data/plans";
import { isStripeSubscriptionsConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

type BillingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const { supabase, user } = await requireDashboardUser();
  const params = searchParams ? await searchParams : {};
  const rawStatus = params.status;
  const status = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const billingEnabled = isStripeSubscriptionsConfigured();

  return (
    <DashboardShell
      title="Billing"
      description="Scegli un piano SaaS per contenuti AI verticali, Business Profile intelligente, Reel, promo automatiche e messaggi clienti."
      userEmail={user.email ?? "utente"}
    >
      {status === "success" ? (
        <div className="mb-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Checkout completato. Per la sincronizzazione automatica del piano serve aggiungere un
          webhook Stripe in una fase successiva.
        </div>
      ) : null}
      {status === "cancel" ? (
        <div className="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
          Hai annullato il checkout subscription prima della conferma.
        </div>
      ) : null}
      <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Stato attuale
        </p>
        <p className="mt-3 text-2xl font-bold text-slate-950">
          {subscription?.plan_id
            ? `${subscription.plan_id} - ${subscription.status}`
            : "Nessun piano attivo sincronizzato"}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Il checkout Stripe subscriptions e gia operativo. Per tenere il piano aggiornato
          automaticamente nel database manca soltanto il webhook di sincronizzazione.
        </p>
      </div>
      {!billingEnabled ? (
        <div className="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
          Stripe subscriptions non e ancora configurato. Aggiungi chiavi Stripe e Price ID dei
          piani per attivare il billing reale.
        </div>
      ) : null}
      <BillingPlans
        plans={plans}
        enabled={billingEnabled}
        disabledMessage="Per attivare il billing servono chiavi Stripe e STRIPE_PRICE_STARTER / PRO / AGENCY."
      />
    </DashboardShell>
  );
}
