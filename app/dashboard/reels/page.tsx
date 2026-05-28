import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function ReelsPage() {
  const { user } = await requireDashboardUser();
  const aiEnabled = isOpenAIConfigured();

  return (
    <DashboardShell
      title="Reel AI"
      description="Crea idee Reel con hook iniziali, struttura e CTA per attirare lead locali e migliorare la comunicazione."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="reel"
        title="Generatore Reel"
        helper="Spiega il tema del Reel, il target e l'obiettivo della pubblicazione. Il sistema prepara uno script rapido adatto a Instagram."
        placeholder="Esempio: Crea un Reel per spiegare la prima visita in palestra a chi si sente intimidito, target principianti 30-50 anni, CTA per prenotare una prova."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore Reel."
      />
    </DashboardShell>
  );
}
