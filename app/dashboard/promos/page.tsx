import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isOpenAIConfigured } from "@/lib/env";
import { requireDashboardUser } from "@/lib/saas";

export default async function PromosPage() {
  const { user } = await requireDashboardUser();
  const aiEnabled = isOpenAIConfigured();

  return (
    <DashboardShell
      title="Promo AI"
      description="Genera offerte commerciali, campagne locali e testi promozionali adatti a palestre e personal trainer."
      userEmail={user.email ?? "utente"}
    >
      <GeneratorWorkspace
        type="promo"
        title="Generatore promo palestra"
        helper="Indica il tipo di promozione, il target, la durata e il tono di voce. L'output sara orientato alla conversione."
        placeholder="Esempio: Crea una promo per settembre dedicata a ex clienti inattivi con tono positivo, invito a tornare e beneficio chiaro."
        enabled={aiEnabled}
        disabledMessage="OpenAI non e configurato. Aggiungi OPENAI_API_KEY per attivare il generatore promo."
      />
    </DashboardShell>
  );
}
