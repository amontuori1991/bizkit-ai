import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SocialCalendarBuilder } from "@/components/dashboard/SocialCalendarBuilder";
import { isBusinessProfileComplete, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function SocialCalendarPage() {
  const { supabase, user } = await requireDashboardUser();
  const aiEnabled = isOpenAIConfigured();
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const businessProfile = (profile as BusinessProfile | null) ?? null;
  const profileReady = isBusinessProfileComplete(businessProfile);

  return (
    <DashboardShell
      title="Social Calendar"
      description="Pianifica 7, 14 o 30 giorni di contenuti usando automaticamente il tuo Business Profile e trasforma il SaaS in un vero planner operativo."
      userEmail={user.email ?? "utente"}
    >
      <SocialCalendarBuilder
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il planner AI."
        profileReady={profileReady}
        profile={businessProfile}
      />
    </DashboardShell>
  );
}
