import type { Metadata } from "next";
import Link from "next/link";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import { isOpenAIConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Demo gratuita",
  description:
    "Prova una generazione AI gratuita di BizKit AI senza login e scopri output short, medium e long per il fitness marketing.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  const aiEnabled = isOpenAIConfigured();

  return (
    <section className="section-shell pt-12 sm:pt-20">
      <div className="container-shell space-y-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          <div className="bg-gradient-to-r from-slate-950 via-blue-900 to-cyan-700 px-6 py-10 text-white sm:px-10">
            <span className="eyebrow border-white/15 bg-white/10 text-white">Demo gratuita</span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Prova BizKit AI senza login
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">
              Hai una sola generazione gratuita da questo browser: ottieni 3 versioni del contenuto
              e valuta subito il livello del prodotto.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="button-primary">
                Crea account
              </Link>
              <Link href="/pricing" className="button-secondary border-white/20 bg-white/10 text-white hover:border-white/40 hover:text-white">
                Vedi i piani
              </Link>
            </div>
          </div>
        </div>

        <GeneratorWorkspace
          type="caption"
          title="Demo Caption AI"
          helper="Scrivi una richiesta breve e ricevi 3 varianti premium. La demo non salva i contenuti e si puo usare una sola volta."
          placeholder="Esempio: Scrivi una caption per promuovere una prova gratuita di 7 giorni in una palestra moderna."
          enabled={aiEnabled}
          disabledMessage="OpenAI non e configurato. La demo AI e temporaneamente disattivata."
          profileReady
          endpoint="/api/ai/demo"
          allowSave={false}
          onboardingTitle="Come funziona la demo"
          onboardingSteps={[
            "Scrivi una richiesta operativa breve, come faresti in un uso reale.",
            "Ricevi tre versioni: short, medium e long.",
            "Se il risultato ti convince, crea un account per sbloccare salvataggi, CRM e cronologia.",
          ]}
          quickTemplates={[
            { label: "Promo estate", prompt: "Scrivi una caption per promuovere una promo estate con posti limitati." },
            { label: "Open day", prompt: "Scrivi una caption per invitare lead locali a un open day in palestra." },
            { label: "Trasformazione cliente", prompt: "Scrivi una caption per raccontare una trasformazione cliente in modo credibile." },
            { label: "Prova gratuita", prompt: "Scrivi una caption per spingere la prova gratuita di 7 giorni." },
            { label: "Recupero inattivi", prompt: "Scrivi una caption per riattivare clienti inattivi con una promo rientro." },
          ]}
        />
      </div>
    </section>
  );
}

