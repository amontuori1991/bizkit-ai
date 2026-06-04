import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import {
  isBusinessProfileComplete,
  pickPrimaryBusinessProfile,
  type BusinessProfile,
} from "@/lib/business-profile";
import { getSportsQuickTemplatesForSubcategory } from "@/lib/business-verticals";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function SportsPromosPage() {
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
  const paintballMode = profile?.sports_subcategory === "paintball";

  return (
    <DashboardShell
      title="Sports Promos AI"
      description={
        paintballMode
          ? "Crea promo paintball piu credibili per compleanni, addii al celibato, team building, gruppi numerosi, tornei e weekend."
          : "Crea promo piu credibili per pacchetti compleanno, team building, prenotazioni campi, tornei ed eventi outdoor."
      }
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="sports_promo"
        title="Generatore promo sport & outdoor"
        helper={
          paintballMode
            ? "Scrivi solo la richiesta operativa. Per Paintball l'AI usa automaticamente promo gruppi, slot weekend, esperienze outdoor, sicurezza, compleanni, team building e addii al celibato."
            : "Scrivi solo la richiesta operativa. Il sistema usera automaticamente sottocategoria, servizi, CTA, target e tono del Business Profile."
        }
        placeholder={
          paintballMode
            ? "Esempio: Crea una promo weekend per gruppi paintball da 8+ persone con prenotazione anticipata e slot limitati."
            : "Esempio: Crea una promo weekend per il paintball con formula gruppi e prenotazione anticipata."
        }
        quickTemplates={getSportsQuickTemplatesForSubcategory("sports_promo", profile?.sports_subcategory)}
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore promo sport & outdoor."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "sports_center"}
      />
    </DashboardShell>
  );
}
