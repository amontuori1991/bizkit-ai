import { ClientsManager } from "@/components/dashboard/ClientsManager";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getPlanUsageSummary } from "@/lib/plan-limits";
import { requireDashboardUser } from "@/lib/saas";

export default async function CrmPage() {
  const { supabase, user } = await requireDashboardUser();
  const [{ data: clients }, { data: accountProfile }] = await Promise.all([
    supabase.from("clients").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle(),
  ]);
  const usage = await getPlanUsageSummary(supabase, {
    userId: user.id,
    subscriptionTier: accountProfile?.subscription_tier,
  });

  return (
    <DashboardShell
      title="CRM clienti"
      description="Una vista semplice per raccogliere lead, seguire clienti e tenere traccia di note operative."
      userEmail={user.email ?? "utente"}
    >
      <ClientsManager
        initialClients={clients ?? []}
        usageProgress={usage.progress.crmClients}
        upgradePlan={usage.limits.nextUpgrade}
      />
    </DashboardShell>
  );
}
