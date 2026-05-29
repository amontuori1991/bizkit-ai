import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, pickPrimaryBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function HairClientMessagesPage() {
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
      title="Hair Client Messages AI"
      description="Genera WhatsApp clienti, reminder appuntamenti, richieste recensione e messaggi win-back per saloni e barber shop."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="hair_client_message"
        title="Generatore messaggi clienti"
        helper="Usa questa area per customer care e fidelizzazione: reminder, recensioni, follow-up e promo trattamenti con CTA chiare."
        placeholder="Esempio: Scrivi un reminder appuntamento elegante per domani alle 15:30."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore messaggi clienti."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "hair_salon"}
        typeOptions={[
          { value: "hair_client_message", label: "WhatsApp clienti" },
          { value: "hair_appointment_reminder", label: "Reminder appuntamento" },
          { value: "hair_review_request", label: "Recensione cliente" },
        ]}
      />
    </DashboardShell>
  );
}
