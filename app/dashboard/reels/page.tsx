import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, pickPrimaryBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function ReelsPage() {
  const { supabase, user } = await requireDashboardUser();
  const aiEnabled = isOpenAIConfigured();
  const { data: profiles } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);
  const profile = pickPrimaryBusinessProfile((profiles as BusinessProfile[] | null) ?? []);
  const profileReady = isBusinessProfileComplete(profile);

  return (
    <DashboardShell
      title="Reel AI"
      description="Crea idee Reel con hook iniziali, struttura e CTA per attirare lead locali e migliorare la comunicazione."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="reel"
        title="Generatore Reel"
        helper="Scrivi solo il concept operativo del Reel. Il sistema usera automaticamente il Business Profile per target, tono, servizi e CTA."
        placeholder="Esempio: Crea un Reel per spiegare come funziona la prima visita in palestra."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore Reel."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "gym"}
      />
    </DashboardShell>
  );
}
