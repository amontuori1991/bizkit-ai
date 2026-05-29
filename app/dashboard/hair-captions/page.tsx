import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, pickPrimaryBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
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

  return (
    <DashboardShell
      title="Hair Captions AI"
      description="Crea caption beauty-first per saloni, barber shop e hair stylist con hook piu virali e CTA booking."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="hair_caption"
        title="Generatore caption per parrucchieri"
        helper="Scrivi solo la richiesta operativa. Il sistema usera automaticamente specialita, stile salone, citta, target, CTA e hashtag del Business Profile."
        placeholder="Esempio: Scrivi una caption per promuovere un balayage premium con posti limitati questa settimana."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore hair captions."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "hair_salon"}
      />
    </DashboardShell>
  );
}
