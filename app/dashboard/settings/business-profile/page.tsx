import { BusinessProfileForm } from "@/components/dashboard/BusinessProfileForm";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { BusinessProfile } from "@/lib/business-profile";
import { getPlanUsageSummary } from "@/lib/plan-limits";
import { requireDashboardUser } from "@/lib/saas";

export default async function BusinessProfilePage() {
  const { supabase, user } = await requireDashboardUser();
  const [{ data: accountProfile }, { data: profiles }] = await Promise.all([
    supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle(),
    supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  const usage = await getPlanUsageSummary(supabase, {
    userId: user.id,
    subscriptionTier: accountProfile?.subscription_tier,
  });

  return (
    <DashboardShell
      title="Business Profile AI Context"
      description="Salva una volta i dati della tua attivita e lascia che i generatori AI li usino automaticamente in caption, Reel, promozioni e messaggi clienti per fitness o hair/beauty."
      userEmail={user.email ?? "utente"}
    >
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">Profilo attivita</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Questo profilo diventa il contesto base di tutte le generazioni AI. Compilalo bene per
            ottenere output piu coerenti con il tuo business, che sia palestra, barber shop o salone parrucchieri.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <BusinessProfileForm
            initialProfiles={(profiles as BusinessProfile[] | null) ?? []}
            planId={usage.planId}
            usageProgress={usage.progress.businessProfiles}
            upgradePlan={usage.limits.nextUpgrade}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
