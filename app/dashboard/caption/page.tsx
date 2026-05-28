import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function CaptionPage() {
  const { user } = await requireDashboardUser();
  const aiEnabled = isOpenAIConfigured();

  return (
    <DashboardShell
      title="Caption AI"
      description="Genera caption professionali per Instagram con tono coerente, CTA chiare e focus business."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="caption"
        title="Generatore caption"
        helper="Descrivi promozione, target, tono di voce e obiettivo. Il sistema produce una caption in italiano pronta all'uso."
        placeholder="Esempio: Scrivi una caption per una promo prova gratuita 7 giorni per una palestra di Torino, target donne 30-45, tono professionale e accogliente."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore caption."
      />
    </DashboardShell>
  );
}
