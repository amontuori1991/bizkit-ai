import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, pickPrimaryBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { getQuickTemplatesForProfile, resolveKnowledgePack } from "@/lib/knowledge-packs";
import { requireDashboardUser } from "@/lib/saas";

export default async function CaptionPage() {
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
  const pack = resolveKnowledgePack(profile);

  return (
    <DashboardShell
      title="Caption AI"
      description={`Genera caption professionali per Instagram con tono coerente, CTA chiare e angoli come ${pack.contentPillars.slice(0, 4).join(", ")}.`}
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="caption"
        title="Generatore caption"
        helper={`Scrivi solo la richiesta operativa. Il sistema usera automaticamente il Business Profile e il knowledge pack ${pack.label} per citta, tone of voice, target, servizi e CTA.`}
        placeholder="Esempio: Scrivi una caption per promuovere la prova gratuita di 7 giorni di questa settimana."
        quickTemplates={getQuickTemplatesForProfile("caption", profile)}
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore caption."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "gym"}
      />
    </DashboardShell>
  );
}
