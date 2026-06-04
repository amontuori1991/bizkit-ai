import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import {
  isBusinessProfileComplete,
  pickPrimaryBusinessProfile,
  type BusinessProfile,
} from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function SportsCaptionsPage() {
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
      title="Sports Captions AI"
      description="Crea caption piu forti per paintball, padel, calcetto e attivita outdoor con CTA orientate a prenotazioni, gruppi ed eventi."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="sports_caption"
        title="Generatore caption sport & outdoor"
        helper="Scrivi solo la richiesta operativa. Il sistema usera automaticamente business type, sottocategoria, citta, target, servizi, CTA e hashtag del Business Profile."
        placeholder="Esempio: Scrivi una caption per promuovere un pacchetto compleanno paintball con posti limitati questo weekend."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore sport & outdoor."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "sports_center"}
      />
    </DashboardShell>
  );
}
