export type PlanId = "starter" | "pro" | "agency";

export type Plan = {
  id: PlanId;
  name: string;
  badge: string;
  description: string;
  priceLabel: string;
  priceMonthlyValue: number;
  seats: string;
  audience: string;
  ctaLabel: string;
  highlight?: boolean;
  usageLimitLabel: string;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    badge: "Per iniziare",
    description: "Per freelance e piccole palestre che vogliono attivare il primo workflow AI senza complessita.",
    priceLabel: "29 EUR/mese",
    priceMonthlyValue: 29,
    seats: "1 utente",
    audience: "Freelance, PT e studi fitness",
    ctaLabel: "Inizia con Starter",
    usageLimitLabel: "Fino a 100 crediti AI al giorno",
    features: [
      "Generatori AI verticali per fitness e hair/beauty con 3 varianti",
      "Business Profile AI Context",
      "Social Calendar Generator da 7, 14 e 30 giorni",
      "CRM clienti essenziale",
      "Cronologia generazioni",
      "Salvataggio contenuti",
      "Template rapidi per promo, open day e booking",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most popular",
    description: "Per team piccoli che vogliono una macchina contenuti piu solida, rapida e professionale.",
    priceLabel: "79 EUR/mese",
    priceMonthlyValue: 79,
    seats: "3 utenti",
    audience: "Palestre strutturate e team marketing",
    ctaLabel: "Passa a Pro",
    highlight: true,
    usageLimitLabel: "Fino a 100 crediti AI al giorno con priorita Pro",
    features: [
      "Tutto in Starter",
      "Workspace premium con onboarding guidato",
      "Template e libreria piu organizzati",
      "Calendari editoriali con storico dedicato",
      "Messaggi clienti, Reel e promo automatiche",
      "Priorita per nuovi template",
      "Esperienza ottimizzata per team piccoli",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    badge: "Per scalare",
    description: "Per consulenti e agenzie che gestiscono piu brand fitness o wellness e vogliono scalare l'operativita.",
    priceLabel: "199 EUR/mese",
    priceMonthlyValue: 199,
    seats: "10 utenti",
    audience: "Agenzie e consulenti multi-cliente",
    ctaLabel: "Sblocca Agency",
    usageLimitLabel: "Fino a 500 crediti AI al giorno",
    features: [
      "Tutto in Pro",
      "Workflow per piu clienti",
      "Setup per team e collaboratori",
      "Pianificazione contenuti ad alto volume",
      "Base ideale per scalare verticali",
      "Maggiore throughput per uso operativo intenso",
    ],
  },
];

export const planMatrix = [
  {
    label: "Crediti AI giornalieri",
    values: { starter: "100", pro: "100", agency: "500" },
  },
  {
    label: "Varianti per output",
    values: { starter: "3", pro: "3", agency: "3" },
  },
  {
    label: "Business Profile AI Context",
    values: { starter: "Si", pro: "Si", agency: "Si" },
  },
  {
    label: "Verticali contenuto AI",
    values: { starter: "Fitness + Hair", pro: "Fitness + Hair", agency: "Multi business" },
  },
  {
    label: "CRM clienti",
    values: { starter: "Base", pro: "Avanzato light", agency: "Per team" },
  },
  {
    label: "Cronologia e contenuti salvati",
    values: { starter: "Si", pro: "Si", agency: "Si" },
  },
  {
    label: "Social Calendar Generator",
    values: { starter: "Si", pro: "Si", agency: "Si" },
  },
  {
    label: "Template rapidi pronti",
    values: { starter: "Fitness + Hair", pro: "Fitness + Hair", agency: "Multi verticale" },
  },
  {
    label: "Messaggi clienti e promo automatiche",
    values: { starter: "Si", pro: "Si", agency: "Si" },
  },
  {
    label: "Ideale per",
    values: {
      starter: "Singolo business",
      pro: "Team interno",
      agency: "Piu clienti",
    },
  },
] as const;
