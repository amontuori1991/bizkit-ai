export type PlanId = "starter" | "pro" | "agency";

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  priceLabel: string;
  seats: string;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Per freelance e palestre che vogliono partire con strumenti AI essenziali.",
    priceLabel: "29 EUR/mese",
    seats: "1 utente",
    features: [
      "Generatori AI per caption, Reel e promo",
      "CRM clienti essenziale",
      "Cronologia generazioni",
      "Salvataggio contenuti",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Per team piccoli che vogliono una base operativa piu strutturata.",
    priceLabel: "79 EUR/mese",
    seats: "3 utenti",
    features: [
      "Tutto in Starter",
      "Workspace piu organizzato",
      "Piu contenuti salvati",
      "Priorita per nuovi template",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    description: "Per consulenti e agenzie che gestiscono piu clienti fitness o wellness.",
    priceLabel: "199 EUR/mese",
    seats: "10 utenti",
    features: [
      "Tutto in Pro",
      "Workflow per piu clienti",
      "Setup per team e collaboratori",
      "Base ideale per scalare verticali",
    ],
  },
];
