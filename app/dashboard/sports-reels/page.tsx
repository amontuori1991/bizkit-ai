import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import {
  isBusinessProfileComplete,
  pickPrimaryBusinessProfile,
  type BusinessProfile,
} from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function SportsReelsPage() {
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
      title="Sports Reels AI"
      description="Genera Reel energici e social-first per centri sportivi, prenotazioni campi, tornei, compleanni e promo weekend."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="sports_reel_script"
        title="Generatore Reel sport & outdoor"
        helper="Scrivi solo la richiesta operativa. L'AI usa automaticamente sottocategoria, CTA, servizi, target e contesto locale del Business Profile."
        placeholder="Esempio: Crea un Reel per promuovere un torneo padel del sabato con iscrizioni aperte."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore Reel sport & outdoor."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "sports_center"}
      />
    </DashboardShell>
  );
}
