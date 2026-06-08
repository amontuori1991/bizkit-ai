import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isBusinessProfileComplete, pickPrimaryBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { getQuickTemplatesForProfile, resolveKnowledgePack } from "@/lib/knowledge-packs";
import { requireDashboardUser } from "@/lib/saas";

export default async function HairPromosPage() {
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
      title="Hair Promos AI"
      description={`Lancia promo per ${pack.label.toLowerCase()} con stile beauty/fashion, valorizzando idee come ${pack.promoIdeas.slice(0, 4).join(", ")}.`}
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="hair_promo"
        title="Generatore promo parrucchieri"
        helper={`Scrivi solo la richiesta operativa breve. Il sistema usera Business Profile e knowledge pack ${pack.label} per stile, specialita, target, CTA e booking link.`}
        placeholder="Esempio: Crea una promo last minute per riempire due slot piega oggi pomeriggio."
        quickTemplates={getQuickTemplatesForProfile("hair_promo", profile)}
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore hair promos."
        profileReady={profileReady}
        businessType={profile?.business_type ?? "hair_salon"}
      />
    </DashboardShell>
  );
}
