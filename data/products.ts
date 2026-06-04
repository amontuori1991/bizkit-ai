export type ProductStatus = "available" | "coming-soon";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  niche:
    | "palestre"
    | "centri-sportivi-outdoor"
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
  demoHref?: string;
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
    demoHref: "/demo?vertical=gym",
  },
  {
    id: "sports-center-kit-001",
    slug: "ai-kit-per-centri-sportivi-outdoor",
    name: "AI Kit Centri Sportivi & Outdoor",
    category: "Sport & Outdoor",
    niche: "centri-sportivi-outdoor",
    price: "29 EUR",
    description:
      "Un kit digitale operativo per paintball, padel, calcetto, tennis, go kart e centri multisport che vogliono creare contenuti, promo, messaggi clienti e calendari con l'AI, con un focus forte su gruppi, eventi e prenotazioni weekend.",
    shortDescription:
      "Prompt, caption, Reel, promo e messaggi clienti per centri sportivi, con Paintball come caso d'uso forte per compleanni, addii al celibato e team building.",
    includes: [
      "90 prompt AI per sport center e outdoor",
      "30 caption Instagram per promo, gruppi, eventi e prenotazioni weekend",
      "20 idee Reel per POV partita, backstage, weekend, compleanni e tornei",
      "Template WhatsApp per conferme, reminder e follow-up prenotazioni",
      "Promo pronte per campi, tornei, team building e pacchetti gruppo",
      "Mini calendario contenuti per centro sportivo",
      "Script per team building, compleanni, addii al celibato e recensioni",
      "Guida rapida all'uso del kit",
    ],
    status: "available",
    demoHref: "/demo?vertical=sports",
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
      "Un kit digitale operativo per saloni parrucchieri, barber shop e hair stylist che vogliono creare contenuti, promozioni, reminder appuntamenti e messaggi clienti con l'AI.",
    shortDescription:
      "Prompt, caption, Reel, promo e messaggi clienti per promuovere servizi hair e aumentare le prenotazioni.",
    includes: [
      "80 prompt AI per parrucchieri e barber shop",
      "30 caption Instagram beauty/hair",
      "20 idee Reel e TikTok hook",
      "Template WhatsApp clienti e reminder",
      "Promo pronte per colore, piega e trattamenti",
      "Mini calendario contenuti per salone",
      "Script prima/dopo e recensioni",
      "Guida rapida all'uso del kit",
    ],
    status: "available",
    demoHref: "/demo?vertical=hair",
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
      "Ora il progetto combina entrambe le anime: il cuore e una piattaforma SaaS con login, dashboard, generatori AI, CRM e billing subscription, mentre i kit digitali per fitness, hair e sport/outdoor restano risorse complementari.",
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
      "Si. La struttura dati e di navigazione supporta gia fitness, hair e centri sportivi/outdoor, ed e pronta per aggiungere anche altre nicchie come ristoranti, estetiste, real estate e hospitality.",
  },
];
