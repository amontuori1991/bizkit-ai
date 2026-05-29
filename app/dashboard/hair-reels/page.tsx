import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, pickPrimaryBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
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

  return (
    <DashboardShell
      title="Hair Reels AI"
      description="Genera script Reel, idee Stories e hook TikTok per trasformazioni capelli, barber fade e promo beauty."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="hair_reel_script"
        title="Generatore Reel e TikTok per saloni"
        helper="Scrivi il concept operativo e lascia che l'AI costruisca hook, script, idea visuale e CTA orientate a booking."
        placeholder="Esempio: Crea un Reel prima/dopo per una trasformazione colore premium."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore hair reels."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "hair_salon"}
        typeOptions={[
          { value: "hair_reel_script", label: "Reel script" },
          { value: "hair_stories_idea", label: "Stories idea" },
          { value: "hair_tiktok_hook", label: "TikTok hook" },
        ]}
      />
    </DashboardShell>
  );
}
