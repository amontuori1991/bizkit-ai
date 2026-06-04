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

export default async function SportsClientMessagesPage() {
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
      title="Sports Client Messages AI"
      description={
        paintballMode
          ? "Genera messaggi WhatsApp paintball pratici per conferme prenotazione, reminder evento, follow-up post partita, recensioni e recupero gruppi."
          : "Genera messaggi clienti per reminder, promo weekend, pacchetti gruppo, recupero inattivi e prenotazioni rapide."
      }
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="sports_client_message"
        title="Generatore messaggi clienti sport & outdoor"
        helper={
          paintballMode
            ? "Scrivi solo la richiesta operativa. Se il profilo attivo e Paintball, l'AI inserisce quando utile data, orario, numero partecipanti, arrivo anticipato, abbigliamento consigliato, sicurezza, caparra e conferma disponibilita."
            : "Scrivi solo la richiesta operativa. L'AI usera automaticamente sottocategoria, CTA, stile e contesto del tuo centro sportivo."
        }
        placeholder={
          paintballMode
            ? "Esempio: Scrivi un messaggio WhatsApp di conferma per un compleanno bambini paintball con orario, arrivo anticipato e abbigliamento consigliato."
            : "Esempio: Scrivi un messaggio WhatsApp per proporre un team building paintball a un'azienda locale."
        }
        quickTemplates={getSportsQuickTemplatesForSubcategory("sports_client_message", profile?.sports_subcategory)}
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare i messaggi clienti sport & outdoor."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "sports_center"}
      />
    </DashboardShell>
  );
}
