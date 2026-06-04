import Link from "next/link";
import { BillingPlans } from "@/components/dashboard/BillingPlans";
import { BillingPortalButton } from "@/components/dashboard/BillingPortalButton";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UsageMeter } from "@/components/dashboard/UsageMeter";
import { plans } from "@/data/plans";
import { env, isStripeSubscriptionsConfigured } from "@/lib/env";
import { getPlanUsageSummary, normalizePlanId } from "@/lib/plan-limits";
import { requireDashboardUser } from "@/lib/saas";

type BillingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatSubscriptionDate(value?: string | null) {
  if (!value) {
    return "Non disponibile";
  }

  return new Date(value).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

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
  const { data: accountProfile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .maybeSingle();
  const usage = await getPlanUsageSummary(supabase, {
    userId: user.id,
    subscriptionTier: accountProfile?.subscription_tier,
  });
  const currentPlanId = normalizePlanId(accountProfile?.subscription_tier);
  const hasManageableSubscription = Boolean(
    subscription?.stripe_customer_id &&
      subscription?.status &&
      ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(subscription.status),
  );

  return (
    <DashboardShell
      title="Billing"
      description="Scegli un piano SaaS per contenuti AI verticali, Business Profile intelligente, Reel, promo automatiche e messaggi clienti."
      userEmail={user.email ?? "utente"}
    >
      {status === "success" ? (
        <div className="mb-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Checkout completato. Stripe inviera il webhook di sincronizzazione appena la subscription
          viene confermata.
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
            : `${currentPlanId.toUpperCase()} - piano applicato in piattaforma`}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Il checkout Stripe subscriptions e operativo. La sincronizzazione automatica del piano
          passa da `/api/stripe/webhook` e richiede `STRIPE_WEBHOOK_SECRET` configurato in Stripe.
        </p>
        {env.stripeWebhookSecret ? (
          <p className="mt-3 text-sm font-medium text-emerald-700">
            Signing secret presente. Verifica che l&apos;endpoint webhook sia registrato nel dashboard Stripe.
          </p>
        ) : null}
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Piano attuale</p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {subscription?.plan_id?.toUpperCase() ?? currentPlanId.toUpperCase()}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Stato subscription</p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {subscription?.status ?? "non sincronizzata"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Prossimo rinnovo</p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {formatSubscriptionDate(subscription?.current_period_end)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Cancel at period end</p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {subscription?.cancel_at_period_end ? "Si" : "No"}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          {hasManageableSubscription ? (
            <BillingPortalButton enabled={billingEnabled} />
          ) : (
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
              <p>
                Nessuna subscription attiva da gestire al momento. Scegli un piano qui sotto per
                attivare il Customer Portal.
              </p>
              <Link href="#billing-plans" className="mt-3 inline-flex font-semibold underline underline-offset-4">
                Vai ai piani
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <UsageMeter
          title="Crediti AI oggi"
          progress={usage.progress.aiCreditsToday}
          helper="Budget runtime applicato ai generatori e al social calendar."
          accent="blue"
          upgradeLabel={usage.limits.nextUpgrade?.toUpperCase() ?? null}
        />
        <UsageMeter
          title="Contenuti salvati"
          progress={usage.progress.savedContents}
          helper="Limite reale del tuo piano per la libreria contenuti."
          accent="amber"
          upgradeLabel={usage.limits.nextUpgrade?.toUpperCase() ?? null}
        />
        <UsageMeter
          title="Calendari"
          progress={usage.progress.calendars}
          helper="Numero massimo di planner completi che puoi tenere nello storico."
          accent="emerald"
          upgradeLabel={usage.limits.nextUpgrade?.toUpperCase() ?? null}
        />
        <UsageMeter
          title="Clienti CRM"
          progress={usage.progress.crmClients}
          helper="Capacita reale del CRM per il piano attuale."
          accent="blue"
          upgradeLabel={usage.limits.nextUpgrade?.toUpperCase() ?? null}
        />
      </div>
      {!billingEnabled ? (
        <div className="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
          Stripe subscriptions non e ancora configurato. Aggiungi chiavi Stripe e Price ID dei
          piani per attivare il billing reale.
        </div>
      ) : null}
      <div id="billing-plans">
        <BillingPlans
          plans={plans}
          enabled={billingEnabled}
          disabledMessage="Per attivare il billing servono chiavi Stripe e STRIPE_PRICE_STARTER / PRO / AGENCY."
          currentPlanId={currentPlanId}
          usageSummary={usage}
        />
      </div>
    </DashboardShell>
  );
}
