import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, pickPrimaryBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { getQuickTemplatesForProfile, resolveKnowledgePack } from "@/lib/knowledge-packs";
import { requireDashboardUser } from "@/lib/saas";

export default async function HairCaptionsPage() {
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
      title="Hair Captions AI"
      description={`Crea caption beauty-first per ${pack.label.toLowerCase()} con hook piu virali e angoli come ${pack.contentPillars.slice(0, 4).join(", ")}.`}
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="hair_caption"
        title="Generatore caption per parrucchieri"
        helper={`Scrivi solo la richiesta operativa. Il sistema usera automaticamente Business Profile e knowledge pack ${pack.label} per specialita, stile, target, CTA e hashtag.`}
        placeholder="Esempio: Scrivi una caption per promuovere un balayage premium con posti limitati questa settimana."
        quickTemplates={getQuickTemplatesForProfile("hair_caption", profile)}
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore hair captions."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "hair_salon"}
      />
    </DashboardShell>
  );
}
