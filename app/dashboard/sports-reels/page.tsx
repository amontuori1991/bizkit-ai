import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import {
  isBusinessProfileComplete,
  pickPrimaryBusinessProfile,
  type BusinessProfile,
} from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { getQuickTemplatesForProfile, resolveKnowledgePack } from "@/lib/knowledge-packs";
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
  const sportsPack = resolveKnowledgePack(profile);
  const specializedMode = profile?.sports_subcategory != null;

  return (
    <DashboardShell
      title="Sports Reels AI"
      description={
        specializedMode
          ? `Genera Reel ${sportsPack.label.toLowerCase()} piu verticali, usando automaticamente idee come ${sportsPack.reelIdeas.slice(0, 4).join(", ")}.`
          : "Genera Reel energici e social-first per centri sportivi, prenotazioni campi, tornei, compleanni e promo weekend."
      }
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="sports_reel_script"
        title="Generatore Reel sport & outdoor"
        helper={
          specializedMode
            ? `Scrivi solo la richiesta operativa. Per ${sportsPack.label} l'AI usa automaticamente le idee Reel e i pilastri del knowledge pack della sottocategoria attiva.`
            : "Scrivi solo la richiesta operativa. L'AI usa automaticamente sottocategoria, CTA, servizi, target e contesto locale del Business Profile."
        }
        placeholder={
          sportsPack.slug === "paintball"
            ? "Esempio: Crea un Reel POV per mostrare una partita paintball tra amici con hook forte e CTA prenotazione weekend."
            : "Esempio: Crea un Reel per promuovere un torneo padel del sabato con iscrizioni aperte."
        }
        quickTemplates={getQuickTemplatesForProfile("sports_reel_script", profile)}
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore Reel sport & outdoor."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "sports_center"}
      />
    </DashboardShell>
  );
}
