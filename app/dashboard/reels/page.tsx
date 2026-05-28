import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function ReelsPage() {
  const { supabase, user } = await requireDashboardUser();
  const aiEnabled = isOpenAIConfigured();
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const profileReady = isBusinessProfileComplete((profile as BusinessProfile | null) ?? null);

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
      />
    </DashboardShell>
  );
}
