import type { Metadata } from "next";
import Link from "next/link";
import { BadgePill } from "@/components/BadgePill";
import { DownloadFileCard } from "@/components/DownloadFileCard";
import {
  GuideIcon,
  OfferIcon,
  PromptIcon,
  SheetIcon,
  WhatsAppIcon,
} from "@/components/KitIcons";
import { TestimonialCard } from "@/components/TestimonialCard";
import { gymKitDownloads } from "@/data/downloads";

export const metadata: Metadata = {
  title: "Thank You",
  description:
    "Accedi alla dashboard premium di BizKit AI per scaricare il kit completo, la preview gratuita e tutti i file operativi del prodotto.",
  robots: {
    index: false,
    follow: false,
  },
};

const previewStats = [
  { label: "Prompt pronti", value: "100" },
  { label: "Template WhatsApp", value: "10" },
  { label: "Idee Reel", value: "30" },
  { label: "Caption", value: "30" },
];

const onboardingSteps = [
  "Apri la guida PDF e leggi il percorso consigliato per i primi 30 minuti.",
  "Scegli un solo obiettivo operativo del mese: lead, rinnovi, open day o retention.",
  "Scarica i fogli in formato XLSX e importali in Google Sheets per lavorare con il team.",
  "Usa i prompt e i template messaggi per lanciare la tua prima micro-campagna in giornata.",
];

const resultsInSevenDays = [
  "Giorno 1: configura il kit, importa i fogli e definisci l'offerta del momento.",
  "Giorno 2: seleziona 10 prompt e crea il piano contenuti della settimana.",
  "Giorno 3: pubblica 1 Reel, 1 post e prepara 1 messaggio promo WhatsApp.",
  "Giorno 4: ricontatta lead e clienti inattivi con i template gia pronti.",
  "Giorno 5: lancia una promo semplice con CTA chiara e tracciamento in foglio.",
  "Giorno 6: raccogli risposte, aggiorna stato lead e identifica i contenuti migliori.",
  "Giorno 7: replica cio che funziona e pianifica la settimana successiva in meno tempo.",
];

const freePreviewHighlights = [
  "10 prompt selezionati",
  "3 Reel esempio",
  "3 caption esempio",
  "2 template WhatsApp",
  "2 offerte promozionali",
];

function getIcon(type: (typeof gymKitDownloads)[number]["type"]) {
  switch (type) {
    case "guide":
      return <GuideIcon />;
    case "prompt":
      return <PromptIcon />;
    case "sheet":
      return <SheetIcon />;
    case "whatsapp":
      return <WhatsAppIcon />;
    case "offer":
      return <OfferIcon />;
    default:
      return <GuideIcon />;
  }
}

export default function ThankYouPage() {
  return (
    <section className="section-shell pt-8 sm:pt-12">
      <div className="container-shell space-y-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(219,234,254,0.72)_30%,_rgba(15,23,42,0.04)_100%)] p-8 shadow-soft sm:p-10">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-blue-600/10 via-white to-slate-200/20" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <BadgePill label="AI Powered" />
                <BadgePill label="Ready to Use" />
                <BadgePill label="Professional Toolkit" />
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  La tua dashboard premium e pronta
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  Qui trovi il kit completo in formato professionale: PDF leggibili, fogli
                  pronti per Google Sheets, copertine curate e una struttura pensata per essere
                  usata davvero da una palestra o da un personal trainer.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/checkout?product=ai-kit-per-palestre" className="button-primary">
                  Sblocca il kit con l&apos;acquisto
                </Link>
                <a
                  href="/downloads/ai-kit-per-palestre/free-preview.pdf"
                  className="button-secondary"
                  download
                >
                  Scarica preview gratuita
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-lg shadow-slate-900/10">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Contenuti premium inclusi</span>
                <span>{gymKitDownloads.length} asset</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {previewStats.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-slate-300">{item.label}</p>
                    <p className="mt-2 text-3xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 p-4">
                <p className="text-sm text-slate-300">Formati inclusi</p>
                <p className="mt-2 text-slate-100">
                  PDF scaricabili per guide e template, XLSX compatibili con importazione e
                  duplicazione in Google Sheets.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                Da dove iniziare
              </p>
              <div className="mt-5 space-y-4">
                {onboardingSteps.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-6 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                Come ottenere risultati in 7 giorni
              </p>
              <div className="mt-5 space-y-3">
                {resultsInSevenDays.map((step) => (
                  <div key={step} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                Preview gratuita
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Usa questa mini risorsa come lead magnet o come assaggio professionale del kit completo.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {freePreviewHighlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <a
                href="/downloads/ai-kit-per-palestre/free-preview.pdf"
                className="button-primary mt-5 w-full"
                download
              >
                Scarica preview gratuita
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Libreria download
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Tutti i file del toolkit premium
                </h2>
              </div>
              <Link href="/prodotto/ai-kit-per-palestre" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                Torna alla pagina prodotto
              </Link>
            </div>
            <div className="mt-6 grid gap-5">
              {gymKitDownloads.map((file) => (
                <DownloadFileCard key={file.id} file={file} icon={getIcon(file.type)} locked />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                Recensioni
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Feedback realistici che aumentano la percezione di valore
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <TestimonialCard
              name="Davide"
              role="Titolare centro fitness indipendente"
              quote="La cosa migliore e che non sembra un pacchetto generico: i file sono gia organizzati per essere usati dal team senza perdere tempo."
            />
            <TestimonialCard
              name="Martina"
              role="Personal trainer e coach online"
              quote="I PDF sono chiari, i fogli si importano bene e la preview gratuita mi sembra perfetta anche come lead magnet."
            />
            <TestimonialCard
              name="Federico"
              role="Consulente marketing per palestre locali"
              quote="La nuova dashboard rende il prodotto piu credibile e premium. Sembra gia pronto per essere venduto senza ulteriori rifiniture."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
