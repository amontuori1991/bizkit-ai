import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function CaptionPage() {
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
      title="Caption AI"
      description="Genera caption professionali per Instagram con tono coerente, CTA chiare e focus business."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="caption"
        title="Generatore caption"
        helper="Scrivi solo la richiesta operativa. Il sistema usera automaticamente il Business Profile per citta, tone of voice, target, servizi e CTA."
        placeholder="Esempio: Scrivi una caption per promuovere la prova gratuita di 7 giorni di questa settimana."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore caption."
        profileReady={profileReady}
      />
    </DashboardShell>
  );
}
