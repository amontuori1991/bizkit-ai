import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, pickPrimaryBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { getQuickTemplatesForProfile, resolveKnowledgePack } from "@/lib/knowledge-packs";
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
  const pack = resolveKnowledgePack(profile);

  return (
    <DashboardShell
      title="Hair Client Messages AI"
      description={`Genera WhatsApp clienti, reminder e win-back per ${pack.label.toLowerCase()} usando template coerenti con il pack attivo.`}
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="hair_client_message"
        title="Generatore messaggi clienti"
        helper={`Usa questa area per customer care e fidelizzazione: reminder, recensioni, follow-up e promo coerenti con il knowledge pack ${pack.label}.`}
        placeholder="Esempio: Scrivi un reminder appuntamento elegante per domani alle 15:30."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore messaggi clienti."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "hair_salon"}
        quickTemplates={getQuickTemplatesForProfile("hair_client_message", profile)}
        quickTemplatesByType={{
          hair_client_message: getQuickTemplatesForProfile("hair_client_message", profile),
          hair_appointment_reminder: getQuickTemplatesForProfile("hair_appointment_reminder", profile),
          hair_review_request: getQuickTemplatesForProfile("hair_review_request", profile),
        }}
        typeOptions={[
          { value: "hair_client_message", label: "WhatsApp clienti" },
          { value: "hair_appointment_reminder", label: "Reminder appuntamento" },
          { value: "hair_review_request", label: "Recensione cliente" },
        ]}
      />
    </DashboardShell>
  );
}
