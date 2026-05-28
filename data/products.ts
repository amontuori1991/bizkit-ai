export type ProductStatus = "available" | "coming-soon";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  niche:
    | "palestre"
    | "ristoranti"
    | "parrucchieri"
    | "estetiste"
    | "agenzie-immobiliari"
    | "b-and-b";
  price: string;
  description: string;
  shortDescription: string;
  includes: string[];
  status: ProductStatus;
};

export const products: Product[] = [
  {
    id: "gym-kit-001",
    slug: "ai-kit-per-palestre",
    name: "AI Kit per Palestre",
    category: "Fitness",
    niche: "palestre",
    price: "29 EUR",
    description:
      "Un pacchetto completo per palestre, personal trainer e centri fitness che vogliono usare l'AI per creare contenuti social, gestire clienti, promozioni e comunicazioni.",
    shortDescription:
      "Prompt, template e fogli operativi per comunicazione, contenuti e gestione clienti nel settore fitness.",
    includes: [
      "100 prompt ChatGPT per palestre",
      "Calendario editoriale 30 giorni",
      "30 idee Reel",
      "30 caption Instagram",
      "Template messaggi WhatsApp",
      "Foglio gestione clienti",
      "Foglio gestione abbonamenti",
      "Offerte promozionali pronte",
      "Mini guida PDF all'uso",
    ],
    status: "available",
  },
  {
    id: "restaurant-kit-001",
    slug: "ai-kit-per-ristoranti",
    name: "AI Kit per Ristoranti",
    category: "Food",
    niche: "ristoranti",
    price: "29 EUR",
    description:
      "Kit in preparazione per aiutare ristoranti e locali a pianificare contenuti, promozioni stagionali e messaggi clienti.",
    shortDescription:
      "Una prossima uscita pensata per menu, promo locali e contenuti social nel mondo food.",
    includes: ["Prompt menu", "Promo locali", "Calendario social", "Messaggi clienti"],
    status: "coming-soon",
  },
  {
    id: "hair-kit-001",
    slug: "ai-kit-per-parrucchieri",
    name: "AI Kit per Parrucchieri",
    category: "Beauty",
    niche: "parrucchieri",
    price: "29 EUR",
    description:
      "Kit in preparazione per saloni e hairstylist che vogliono promuovere servizi, appuntamenti e offerte.",
    shortDescription:
      "Una prossima uscita dedicata a contenuti, appuntamenti e promo per saloni.",
    includes: ["Prompt promozioni", "Caption prima/dopo", "Template reminder", "Mini calendario"],
    status: "coming-soon",
  },
  {
    id: "beauty-kit-001",
    slug: "ai-kit-per-estetiste",
    name: "AI Kit per Estetiste",
    category: "Wellness",
    niche: "estetiste",
    price: "29 EUR",
    description:
      "Kit in preparazione per centri estetici che vogliono semplificare offerte, follow-up e contenuti informativi.",
    shortDescription:
      "Una prossima uscita per gestire promozioni beauty e messaggi cliente con maggiore continuita.",
    includes: ["Prompt offerte", "Follow-up cliente", "Idee contenuto", "Script WhatsApp"],
    status: "coming-soon",
  },
  {
    id: "real-estate-kit-001",
    slug: "ai-kit-per-agenzie-immobiliari",
    name: "AI Kit per Agenzie Immobiliari",
    category: "Real Estate",
    niche: "agenzie-immobiliari",
    price: "39 EUR",
    description:
      "Kit in preparazione per agenzie che vogliono velocizzare annunci, follow-up lead e presentazioni immobili.",
    shortDescription:
      "Una prossima uscita per annunci, lead nurturing e comunicazione immobiliare.",
    includes: ["Prompt annunci", "Script follow-up", "Checklist lead", "Template visite"],
    status: "coming-soon",
  },
  {
    id: "bnb-kit-001",
    slug: "ai-kit-per-b-and-b",
    name: "AI Kit per B&B",
    category: "Hospitality",
    niche: "b-and-b",
    price: "29 EUR",
    description:
      "Kit in preparazione per strutture ricettive che vogliono migliorare messaggi ospiti, promo stagionali e contenuti.",
    shortDescription:
      "Una prossima uscita per messaggi ospiti, accoglienza e promozioni nel settore hospitality.",
    includes: ["Messaggi ospiti", "Prompt offerte", "Caption stagionali", "Checklist check-in"],
    status: "coming-soon",
  },
];

export const faqs = [
  {
    question: "BizKit AI ora e un SaaS o resta un download store?",
    answer:
      "Ora il progetto combina entrambe le anime: il cuore e una piattaforma SaaS con login, dashboard, generatori AI, CRM e billing subscription, mentre il kit fitness resta una risorsa digitale complementare.",
  },
  {
    question: "Serve esperienza tecnica per usare i generatori AI?",
    answer:
      "No. Il prodotto e pensato per utenti business: inserisci il contesto e ricevi output pronti da adattare, con storico e salvataggio direttamente in dashboard.",
  },
  {
    question: "I pagamenti ricorrenti sono gia predisposti?",
    answer:
      "Si. Il checkout subscription usa Stripe in modalita subscription per i piani Starter, Pro e Agency. Per una sincronizzazione completa dello stato del piano manca solo il webhook Stripe.",
  },
  {
    question: "Dove vengono salvati clienti e contenuti?",
    answer:
      "I dati applicativi sono pensati per Supabase, con tabelle dedicate a profili, clienti, generazioni, contenuti salvati e subscriptions protette da Row Level Security.",
  },
  {
    question: "Posso estendere il prodotto ad altre nicchie?",
    answer:
      "Si. La struttura dati e di navigazione e gia pronta per aggiungere nuovi verticali come ristoranti, parrucchieri, estetiste, agenzie immobiliari e B&B.",
  },
];
