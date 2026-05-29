import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, pickPrimaryBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function PromosPage() {
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
      title="Promo AI"
      description="Genera offerte commerciali, campagne locali e testi promozionali adatti a palestre e personal trainer."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="promo"
        title="Generatore promo palestra"
        helper="Scrivi solo la richiesta operativa breve. Il sistema usera automaticamente citta, target, tone of voice, USP e CTA dal Business Profile."
        placeholder="Esempio: Crea una promo per riportare in palestra clienti inattivi a settembre."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore promo."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "gym"}
      />
    </DashboardShell>
  );
}
