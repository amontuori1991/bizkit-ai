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
      "1 Business Profile AI Context",
      "Social Calendar Generator da 7, 14 e 30 giorni",
      "Fino a 100 contenuti salvati",
      "Fino a 20 calendari salvati",
      "CRM fino a 100 clienti",
      "Cronologia generazioni",
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
    usageLimitLabel: "Fino a 300 crediti AI al giorno con cooldown ridotto",
    features: [
      "Tutto in Starter",
      "Fino a 3 Business Profile",
      "Fino a 1000 contenuti salvati",
      "Fino a 200 calendari salvati",
      "CRM fino a 1000 clienti",
      "Cooldown piu rapido per uso quotidiano",
      "Esperienza ottimizzata per team piccoli da 3 utenti",
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
    usageLimitLabel: "Fino a 1000 crediti AI al giorno",
    features: [
      "Tutto in Pro",
      "Business Profile illimitati",
      "Contenuti salvati illimitati",
      "Calendari illimitati",
      "Clienti CRM illimitati",
      "Cooldown minimo e throughput alto",
      "Setup ideale per team e collaboratori fino a 10 utenti",
    ],
  },
];

export const planMatrix = [
  {
    label: "Crediti AI giornalieri",
    values: { starter: "100", pro: "300", agency: "1000" },
  },
  {
    label: "Varianti per output",
    values: { starter: "3", pro: "3", agency: "3" },
  },
  {
    label: "Business Profile AI Context",
    values: { starter: "1", pro: "3", agency: "Illimitati" },
  },
  {
    label: "Verticali contenuto AI",
    values: { starter: "Fitness + Hair", pro: "Fitness + Hair", agency: "Multi business" },
  },
  {
    label: "CRM clienti",
    values: { starter: "100 clienti", pro: "1000 clienti", agency: "Illimitato" },
  },
  {
    label: "Cronologia e contenuti salvati",
    values: { starter: "100 asset", pro: "1000 asset", agency: "Illimitati" },
  },
  {
    label: "Social Calendar Generator",
    values: { starter: "20 calendari", pro: "200 calendari", agency: "Illimitati" },
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
    label: "Utenti inclusi",
    values: {
      starter: "1",
      pro: "3",
      agency: "10",
    },
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
