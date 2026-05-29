import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function HairPromosPage() {
  const { supabase, user } = await requireDashboardUser();
  const aiEnabled = isOpenAIConfigured();
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const profileReady = isBusinessProfileComplete((profile as BusinessProfile | null) ?? null);

  return (
    <DashboardShell
      title="Hair Promos AI"
      description="Lancia promo colore, piega, trattamenti e offerte last minute con stile beauty/fashion orientato a prenotazioni."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="hair_promo"
        title="Generatore promo parrucchieri"
        helper="Scrivi solo la richiesta operativa breve. Il sistema usera stile salone, specialita, target, CTA e booking link dal Business Profile."
        placeholder="Esempio: Crea una promo last minute per riempire due slot piega oggi pomeriggio."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore hair promos."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "hair_salon"}
      />
    </DashboardShell>
  );
}

