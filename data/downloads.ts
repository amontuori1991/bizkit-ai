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

export type ProductDownloadBundle = {
  files: DownloadFile[];
  zipFileName: string;
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
    id: "crm-import-template",
    label: "Template import CRM",
    description: "File Excel pronto per importare contatti in BizKit AI con intestazioni gia compatibili.",
    fileName: "template-import-contatti-palestre.xlsx",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/clienti.svg",
    badges: ["Professional Toolkit", "Import Ready"],
    metrics: ["Excel template", "Bulk import", "CRM ready"],
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

export const hairKitDownloads: DownloadFile[] = [
  {
    id: "prompts",
    label: "80 prompt AI hair",
    description: "Prompt pronti per caption, promo, TikTok hook e messaggi clienti per saloni e barber shop.",
    fileName: "prompt-ai-parrucchieri.md",
    type: "prompt",
    coverHref: "/downloads/ai-kit-per-palestre/covers/prompt.svg",
    badges: ["Ready to Use", "Markdown"],
    metrics: ["80 prompt", "Beauty tone", "Booking oriented"],
  },
  {
    id: "captions",
    label: "30 caption Instagram beauty",
    description: "Caption con hook, CTA e hashtag pensate per colore, taglio, piega e trasformazioni.",
    fileName: "caption-instagram-parrucchieri.csv",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/caption.svg",
    badges: ["AI Powered", "CSV"],
    metrics: ["30 caption", "CTA booking", "Beauty hashtags"],
  },
  {
    id: "reels",
    label: "20 idee Reel e TikTok",
    description: "Hook e script rapidi per before/after, trend, promo stagionali e prova servizi.",
    fileName: "idee-reel-parrucchieri.csv",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/reel.svg",
    badges: ["Social First", "CSV"],
    metrics: ["20 Reel", "Hook virali", "TikTok ready"],
  },
  {
    id: "messages",
    label: "Messaggi clienti e reminder",
    description: "Template WhatsApp pronti per reminder appuntamento, promo last minute e recupero clienti.",
    fileName: "messaggi-clienti-parrucchieri.md",
    type: "whatsapp",
    coverHref: "/downloads/ai-kit-per-palestre/covers/whatsapp.svg",
    badges: ["Ready to Use", "Markdown"],
    metrics: ["Reminder", "Retention", "WhatsApp friendly"],
  },
  {
    id: "offers",
    label: "Promo parrucchieri pronte",
    description: "Offerte per balayage, piega, barber fade, trattamenti e pacchetti colore orientati a conversione.",
    fileName: "promo-parrucchieri.md",
    type: "offer",
    coverHref: "/downloads/ai-kit-per-palestre/covers/offerte.svg",
    badges: ["Professional Toolkit", "Markdown"],
    metrics: ["12 offerte", "Booking focus", "Adattabili"],
  },
  {
    id: "crm-import-template",
    label: "Template import clienti beauty",
    description: "File Excel pronto per importare clienti, trattamenti e note operative nel CRM.",
    fileName: "template-import-contatti-parrucchieri.xlsx",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/clienti.svg",
    badges: ["Professional Toolkit", "Import Ready"],
    metrics: ["Excel template", "Beauty CRM", "Bulk import"],
  },
  {
    id: "readme",
    label: "Guida rapida del kit",
    description: "Come usare il pacchetto, quali generatori attivare e come trasformarlo in prenotazioni.",
    fileName: "README.txt",
    type: "guide",
    coverHref: "/downloads/ai-kit-per-palestre/covers/readme.svg",
    badges: ["Quick Start", "TXT"],
    metrics: ["Workflow rapido", "Uso immediato", "Best practices"],
  },
];

export const sportsCenterKitDownloads: DownloadFile[] = [
  {
    id: "prompts",
    label: "90 prompt AI sport & outdoor",
    description: "Prompt pronti per promo weekend, compleanni, team building, prenotazioni campi e tornei.",
    fileName: "prompt-ai-centri-sportivi.md",
    type: "prompt",
    coverHref: "/downloads/ai-kit-per-palestre/covers/prompt.svg",
    badges: ["Ready to Use", "Markdown"],
    metrics: ["90 prompt", "Booking focus", "Multi sport"],
  },
  {
    id: "captions",
    label: "30 caption Instagram sport",
    description: "Caption con hook, CTA e hashtag pensate per gruppi, eventi, promo weekend e prenotazioni.",
    fileName: "caption-instagram-centri-sportivi.csv",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/caption.svg",
    badges: ["AI Powered", "CSV"],
    metrics: ["30 caption", "CTA prenotazione", "Local ready"],
  },
  {
    id: "reels",
    label: "20 idee Reel weekend & tornei",
    description: "Hook e script rapidi per compleanni, team building, tornei, promo weekend e backstage.",
    fileName: "idee-reel-centri-sportivi.csv",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/reel.svg",
    badges: ["Social First", "CSV"],
    metrics: ["20 Reel", "Hook dinamici", "Outdoor ready"],
  },
  {
    id: "messages",
    label: "Messaggi clienti e reminder",
    description: "Template WhatsApp per prenotazioni, recupero clienti, follow-up e slot last minute.",
    fileName: "messaggi-clienti-centri-sportivi.md",
    type: "whatsapp",
    coverHref: "/downloads/ai-kit-per-palestre/covers/whatsapp.svg",
    badges: ["Ready to Use", "Markdown"],
    metrics: ["Reminder", "Prenotazioni", "Gruppi"],
  },
  {
    id: "offers",
    label: "Promo sport center pronte",
    description: "Offerte per pacchetti gruppo, campi, weekend, team building e tornei orientati a conversione.",
    fileName: "promo-centri-sportivi.md",
    type: "offer",
    coverHref: "/downloads/ai-kit-per-palestre/covers/offerte.svg",
    badges: ["Professional Toolkit", "Markdown"],
    metrics: ["12 offerte", "Weekend focus", "Adattabili"],
  },
  {
    id: "crm-import-template",
    label: "Template import contatti sport",
    description: "File Excel pronto per importare contatti, gruppi, pacchetti ed esperienze nel CRM.",
    fileName: "template-import-contatti-centri-sportivi.xlsx",
    type: "sheet",
    coverHref: "/downloads/ai-kit-per-palestre/covers/clienti.svg",
    badges: ["Professional Toolkit", "Import Ready"],
    metrics: ["Excel template", "Groups ready", "Bulk import"],
  },
  {
    id: "readme",
    label: "Guida rapida del kit",
    description: "Come usare il pacchetto, quali generatori attivare e come trasformarlo in prenotazioni ed eventi.",
    fileName: "README.txt",
    type: "guide",
    coverHref: "/downloads/ai-kit-per-palestre/covers/readme.svg",
    badges: ["Quick Start", "TXT"],
    metrics: ["Workflow rapido", "Uso immediato", "Best practices"],
  },
];

export const downloadsByProductSlug: Record<string, ProductDownloadBundle> = {
  "ai-kit-per-palestre": {
    files: gymKitDownloads,
    zipFileName: "ai-kit-per-palestre.zip",
  },
  "ai-kit-per-parrucchieri": {
    files: hairKitDownloads,
    zipFileName: "ai-kit-per-parrucchieri.zip",
  },
  "ai-kit-per-centri-sportivi-outdoor": {
    files: sportsCenterKitDownloads,
    zipFileName: "ai-kit-per-centri-sportivi-outdoor.zip",
  },
};

export function getDownloadsByProductSlug(slug?: string | null) {
  if (!slug) {
    return null;
  }

  return downloadsByProductSlug[slug] ?? null;
}
