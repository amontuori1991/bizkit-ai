import { ClientsManager } from "@/components/dashboard/ClientsManager";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireDashboardUser } from "@/lib/saas";

export default async function CrmPage() {
  const { supabase, user } = await requireDashboardUser();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardShell
      title="CRM clienti"
      description="Una vista semplice per raccogliere lead, seguire clienti e tenere traccia di note operative."
      userEmail={user.email ?? "utente"}
    >
      <ClientsManager initialClients={clients ?? []} />
    </DashboardShell>
  );
}
