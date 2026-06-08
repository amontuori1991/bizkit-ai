import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, pickPrimaryBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { getQuickTemplatesForProfile, resolveKnowledgePack } from "@/lib/knowledge-packs";
import { requireDashboardUser } from "@/lib/saas";

export default async function HairReelsPage() {
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
      title="Hair Reels AI"
      description={`Genera script Reel, Stories e hook TikTok per ${pack.label.toLowerCase()}, usando idee come ${pack.reelIdeas.slice(0, 4).join(", ")}.`}
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="hair_reel_script"
        title="Generatore Reel e TikTok per saloni"
        helper={`Scrivi il concept operativo e lascia che l'AI costruisca hook, script, idea visuale e CTA usando il knowledge pack ${pack.label}.`}
        placeholder="Esempio: Crea un Reel prima/dopo per una trasformazione colore premium."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore hair reels."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "hair_salon"}
        quickTemplates={getQuickTemplatesForProfile("hair_reel_script", profile)}
        quickTemplatesByType={{
          hair_reel_script: getQuickTemplatesForProfile("hair_reel_script", profile),
          hair_stories_idea: getQuickTemplatesForProfile("hair_stories_idea", profile),
          hair_tiktok_hook: getQuickTemplatesForProfile("hair_tiktok_hook", profile),
        }}
        typeOptions={[
          { value: "hair_reel_script", label: "Reel script" },
          { value: "hair_stories_idea", label: "Stories idea" },
          { value: "hair_tiktok_hook", label: "TikTok hook" },
        ]}
      />
    </DashboardShell>
  );
}
