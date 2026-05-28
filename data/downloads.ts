export type DownloadFile = {
  id: string;
  label: string;
  description: string;
  fileName: string;
  type: "guide" | "prompt" | "sheet" | "whatsapp" | "offer";
  previewHref?: string;
  coverHref: string;
  badges: string[];
  metrics: string[];
};

export const gymKitDownloads: DownloadFile[] = [
  {
    id: "guide",
    label: "Guida del kit",
    description: "Introduzione, metodo d'uso, istruzioni operative ed esempi pratici.",
    fileName: "guida-ai-kit-palestre.pdf",
    type: "guide",
    coverHref: "/downloads/ai-kit-per-palestre/covers/guida.svg",
    badges: ["AI Powered", "PDF"],
    metrics: ["Guida completa", "Step by step", "Uso operativo"],
  },
  {
    id: "prompts",
    label: "100 prompt ChatGPT",
    description: "Prompt divisi per categorie per contenuti, clienti, offerte e recensioni.",
    fileName: "prompt-chatgpt-palestre.pdf",
    type: "prompt",
    previewHref: "/downloads/ai-kit-per-palestre/free-preview.pdf",
    coverHref: "/downloads/ai-kit-per-palestre/covers/prompt.svg",
    badges: ["Ready to Use", "PDF"],
    metrics: ["100 prompt", "10 categorie", "Alta usabilita"],
  },
  {
    id: "calendar",
    label: "Calendario editoriale 30 giorni",
    description: "Piano pronto per pubblicare contenuti per un mese intero.",
    fileName: "calendario-editoriale-30-giorni.xlsx",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/calendario.svg",
    badges: ["Professional Toolkit", "Sheets Ready"],
    metrics: ["30 giorni", "CTA incluse", "Google Sheets friendly"],
  },
  {
    id: "reels",
    label: "30 idee Reel",
    description: "Hook, script breve e CTA per video rapidi e concreti.",
    fileName: "idee-reel-30-giorni.xlsx",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/reel.svg",
    badges: ["Ready to Use", "Sheets Ready"],
    metrics: ["30 Reel", "Hook iniziali", "CTA incluse"],
  },
  {
    id: "captions",
    label: "30 caption Instagram",
    description: "Caption pronte con CTA e hashtag per il settore fitness.",
    fileName: "caption-instagram-30.xlsx",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/caption.svg",
    badges: ["AI Powered", "Sheets Ready"],
    metrics: ["30 caption", "Hashtag inclusi", "Uso rapido"],
  },
  {
    id: "whatsapp",
    label: "Template WhatsApp",
    description: "Messaggi pronti per reminder, rinnovi, promo e follow-up.",
    fileName: "messaggi-whatsapp-template.pdf",
    type: "whatsapp",
    coverHref: "/downloads/ai-kit-per-palestre/covers/whatsapp.svg",
    badges: ["Ready to Use", "PDF"],
    metrics: ["10 template", "Lead e retention", "Tono professionale"],
  },
  {
    id: "clients",
    label: "Foglio gestione clienti",
    description: "Tracciamento rapido di iscrizioni, stato cliente e note operative.",
    fileName: "gestione-clienti.xlsx",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/clienti.svg",
    badges: ["Professional Toolkit", "Sheets Ready"],
    metrics: ["Lead tracking", "Note operative", "Filtro rapido"],
  },
  {
    id: "subscriptions",
    label: "Foglio gestione abbonamenti",
    description: "Monitoraggio di piani, scadenze, pagamenti e metodo utilizzato.",
    fileName: "gestione-abbonamenti.xlsx",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/abbonamenti.svg",
    badges: ["Professional Toolkit", "Sheets Ready"],
    metrics: ["Scadenze", "Pagamenti", "Piani"],
  },
  {
    id: "offers",
    label: "20 offerte promozionali",
    description: "Idee commerciali pronte per palestre e personal trainer.",
    fileName: "offerte-promozionali.pdf",
    type: "offer",
    coverHref: "/downloads/ai-kit-per-palestre/covers/offerte.svg",
    badges: ["AI Powered", "PDF"],
    metrics: ["20 offerte", "Conversion oriented", "Adattabili"],
  },
  {
    id: "readme",
    label: "README del pacchetto",
    description: "Panoramica completa del contenuto e suggerimenti d'uso.",
    fileName: "README.pdf",
    type: "guide",
    coverHref: "/downloads/ai-kit-per-palestre/covers/readme.svg",
    badges: ["Quick Start", "PDF"],
    metrics: ["Panoramica", "Come usare", "Workflow rapido"],
  },
];
