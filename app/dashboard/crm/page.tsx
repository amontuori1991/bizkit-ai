import { ClientsManager } from "@/components/dashboard/ClientsManager";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { pickPrimaryBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { getPlanUsageSummary } from "@/lib/plan-limits";
import { requireDashboardUser } from "@/lib/saas";

export default async function CrmPage() {
  const { supabase, user } = await requireDashboardUser();
  const [{ data: clients }, { data: accountProfile }, { data: businessProfiles }] = await Promise.all([
    supabase.from("clients").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle(),
    supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const usage = await getPlanUsageSummary(supabase, {
    userId: user.id,
    subscriptionTier: accountProfile?.subscription_tier,
  });
  const businessProfile = pickPrimaryBusinessProfile((businessProfiles as BusinessProfile[] | null) ?? []);

  return (
    <DashboardShell
      title="CRM clienti"
      description="Una vista semplice per raccogliere lead, seguire clienti, importare contatti da Excel e tenere traccia di note operative."
      userEmail={user.email ?? "utente"}
    >
      <ClientsManager
        initialClients={clients ?? []}
        usageProgress={usage.progress.crmClients}
        upgradePlan={usage.limits.nextUpgrade}
        businessProfile={businessProfile}
      />
    </DashboardShell>
  );
}
