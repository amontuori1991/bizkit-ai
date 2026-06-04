import type {
  AIContentType,
  QuickTemplate,
  SportsCenterSubcategory,
} from "@/lib/business-verticals";

export type SportsKnowledgePackTemplate = {
  title: string;
  prompt: string;
  body?: string;
};

export type SportsKnowledgePack = {
  subcategory: SportsCenterSubcategory | "generic";
  label: string;
  activeVerticalLabel: string;
  positioning: string;
  contentPillars: string[];
  offerTypes: string[];
  crmSuggestions: string[];
  crmTemplates: SportsKnowledgePackTemplate[];
  seasonalCampaigns: string[];
  socialCalendarIdeas: string[];
  reelIdeas: string[];
  promoIdeas: string[];
  clientMessages: string[];
  supportedCalendarFormats: Array<
    "Post Instagram" | "Reel" | "Story" | "TikTok" | "WhatsApp follow-up"
  >;
  quickTemplates: Partial<Record<AIContentType, QuickTemplate[]>>;
};

const genericSportsPack: SportsKnowledgePack = {
  subcategory: "generic",
  label: "Centro sportivo & outdoor",
  activeVerticalLabel: "Sports & Outdoor",
  positioning:
    "Esperienza di gruppo, prenotazioni semplici, attivita outdoor e contenuti orientati a eventi, community e conversione.",
  contentPillars: [
    "promo weekend",
    "prenotazioni",
    "gruppi ed eventi",
    "recensioni clienti",
    "backstage",
    "community locale",
    "offerte stagionali",
    "attivita di prova",
  ],
  offerTypes: [
    "promo slot liberi",
    "pacchetti gruppo",
    "eventi privati",
    "giornate prova",
    "tornei o campionati",
    "lezioni o sessioni guidate",
  ],
  crmSuggestions: [
    "Segmenta lead per prenotazioni singole, gruppi ed eventi.",
    "Tieni separati clienti attivi, richieste da seguire e ricorrenze stagionali.",
    "Usa follow-up rapidi per spingere prenotazioni, reminder e riattivazione.",
  ],
  crmTemplates: [
    {
      title: "Reminder prenotazione",
      prompt:
        "Scrivi un messaggio WhatsApp per ricordare una prenotazione e ridurre i no-show.",
    },
    {
      title: "Promo weekend",
      prompt:
        "Scrivi un messaggio clienti per spingere una promo weekend con posti limitati.",
    },
    {
      title: "Recupero clienti inattivi",
      prompt:
        "Scrivi un messaggio per riattivare clienti che non prenotano da settimane.",
    },
  ],
  seasonalCampaigns: [
    "weekend ad alta affluenza",
    "promo estate",
    "eventi aziendali di primavera",
    "pacchetti gruppo autunnali",
  ],
  socialCalendarIdeas: [
    "promo",
    "educazione",
    "community",
    "recensioni",
    "eventi",
    "backstage",
    "conversione prenotazioni",
  ],
  reelIdeas: [
    "esperienza sul campo",
    "dietro le quinte",
    "gruppo in azione",
    "highlight del weekend",
  ],
  promoIdeas: [
    "offerta last minute",
    "pacchetto gruppo",
    "evento privato",
    "weekend booking",
  ],
  clientMessages: [
    "conferma prenotazione",
    "reminder",
    "follow-up",
    "richiesta recensione",
  ],
  supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
  quickTemplates: {},
};

const sportsKnowledgePacks: Partial<Record<SportsCenterSubcategory, SportsKnowledgePack>> = {
  paintball: {
    subcategory: "paintball",
    label: "Paintball",
    activeVerticalLabel: "Sports & Outdoor",
    positioning:
      "Adrenalina, gioco di squadra, strategia, sicurezza, esperienza outdoor e prenotazioni di gruppo per compleanni, addii al celibato, team building e weekend.",
    contentPillars: [
      "compleanni bambini",
      "addii al celibato",
      "team building aziendale",
      "gruppi di amici",
      "tornei",
      "paintball kids",
      "sicurezza e attrezzatura",
      "dietro le quinte",
      "modalita di gioco",
      "recensioni clienti",
      "promo weekend",
      "eventi privati",
      "gruppi numerosi",
      "esperienza outdoor",
      "FAQ prima volta",
    ],
    offerTypes: [
      "pacchetto compleanno kids",
      "addio al celibato di gruppo",
      "team building outdoor",
      "promo weekend gruppi",
      "torneo paintball",
      "evento privato aziendale",
    ],
    crmSuggestions: [
      "Segmenta lead per compleanni, addii al celibato, team building e gruppi amici.",
      "Traccia richieste gruppi, caparre, slot orari e disponibilita weekend per follow-up piu veloci.",
      "Usa note e stato cliente per distinguere preventivi inviati, reminder da fare e gruppi da richiamare.",
    ],
    crmTemplates: [
      {
        title: "Conferma prenotazione",
        prompt:
          "Scrivi un messaggio WhatsApp paintball per confermare una prenotazione con data, orario, numero partecipanti e arrivo anticipato.",
        body:
          "Ciao [Nome], ti confermiamo la prenotazione Paintball per [Data] alle [Orario] per [Numero] partecipanti. Ti chiediamo di arrivare 20 minuti prima per briefing sicurezza e organizzazione squadre. Consigliamo abbigliamento comodo e scarpe sportive. Caparra/saldo: [Dettagli]. Rispondi a questo messaggio per confermare definitivamente la disponibilita.",
      },
      {
        title: "Reminder evento",
        prompt:
          "Scrivi un reminder WhatsApp paintball pratico con abbigliamento consigliato, sicurezza e orario di arrivo.",
        body:
          "Ciao [Nome], promemoria per la vostra partita Paintball di [Data] alle [Orario]. Partecipanti previsti: [Numero]. Arrivate 20 minuti prima per registrazione, briefing sicurezza e consegna attrezzatura. Vestiti consigliati: comodi, sportivi, con scarpe chiuse. Per qualsiasi variazione scrivici qui.",
      },
      {
        title: "Follow-up post partita",
        prompt:
          "Scrivi un follow-up WhatsApp post partita paintball per ringraziare il gruppo e proporre una nuova prenotazione.",
        body:
          "Ciao [Nome], grazie per aver giocato con noi oggi. Speriamo che il gruppo si sia divertito tra adrenalina, strategia e sfide sul campo. Se vuoi, possiamo gia proporti una nuova data per torneo, compleanno o rivincita tra amici.",
      },
      {
        title: "Richiesta recensione",
        prompt:
          "Scrivi un messaggio WhatsApp per chiedere una recensione dopo un evento paintball di gruppo.",
        body:
          "Ciao [Nome], grazie ancora per la tua esperienza Paintball con noi. Se ti sei trovato bene, ci farebbe davvero comodo una recensione: aiuta altri gruppi a sceglierci per compleanni, addii al celibato ed eventi outdoor. Link recensione: [Link].",
      },
      {
        title: "Recupero clienti inattivi",
        prompt:
          "Scrivi un messaggio per riattivare clienti Paintball con promo weekend e disponibilita di gruppo.",
        body:
          "Ciao [Nome], e un po' che non ci vediamo sul campo. Questo mese abbiamo promo weekend e slot dedicati a gruppi amici, compleanni e team building. Se vuoi ti mando subito disponibilita e pacchetti aggiornati.",
      },
      {
        title: "Proposta team building",
        prompt:
          "Scrivi un messaggio commerciale paintball per proporre un team building aziendale outdoor.",
        body:
          "Ciao [Nome], ti contatto per proporti un team building outdoor Paintball per il tuo team. Possiamo organizzare esperienza con briefing sicurezza, modalita di gioco, gestione gruppi e slot personalizzati in base al numero partecipanti. Se ti interessa, ti invio una proposta rapida con disponibilita e costi.",
      },
      {
        title: "Proposta compleanno",
        prompt:
          "Scrivi un messaggio WhatsApp per proporre un compleanno paintball con formula bambini o ragazzi.",
        body:
          "Ciao [Nome], per compleanni Paintball possiamo organizzare un'esperienza divertente e sicura con gruppi dedicati, briefing iniziale, attrezzatura inclusa e slot nel weekend. Se vuoi, ti mando opzioni disponibili in base a data, eta dei partecipanti e numero del gruppo.",
      },
      {
        title: "Proposta addio al celibato",
        prompt:
          "Scrivi un messaggio WhatsApp per proporre un addio al celibato paintball con slot weekend.",
        body:
          "Ciao [Nome], per un addio al celibato Paintball possiamo preparare un'esperienza adrenalinica per il gruppo con match dedicati, modalita speciali e slot weekend. Se mi dici data indicativa e numero partecipanti, ti mando subito disponibilita e proposta.",
      },
    ],
    seasonalCampaigns: [
      "promo weekend gruppi",
      "compleanni primavera-estate",
      "team building autunnale",
      "torneo stagionale",
      "eventi privati pre-festivi",
    ],
    socialCalendarIdeas: [
      "promo",
      "educazione",
      "intrattenimento",
      "recensioni",
      "backstage",
      "eventi",
      "sicurezza",
      "conversione prenotazioni",
    ],
    reelIdeas: [
      "POV partita",
      "sicurezza e attrezzatura",
      "pacchetto amici",
      "modalita Caccia al Coniglio",
      "evento aziendale outdoor",
      "recensione gruppo",
    ],
    promoIdeas: [
      "promo weekend gruppi",
      "compleanno bambini paintball",
      "addio al celibato paintball",
      "torneo paintball",
      "evento aziendale outdoor",
      "pacchetto amici",
    ],
    clientMessages: [
      "conferma prenotazione",
      "reminder evento",
      "follow-up post partita",
      "richiesta recensione",
      "proposta team building",
      "proposta compleanno",
      "proposta addio al celibato",
    ],
    supportedCalendarFormats: [
      "Post Instagram",
      "Reel",
      "Story",
      "TikTok",
      "WhatsApp follow-up",
    ],
    quickTemplates: {
      sports_caption: [
        { label: "Compleanno bambini paintball", prompt: "Scrivi una caption per promuovere un compleanno bambini paintball con formula kids, sicurezza inclusa e CTA prenotazione weekend." },
        { label: "Addio al celibato paintball", prompt: "Scrivi una caption per vendere un addio al celibato paintball ad alto divertimento, gruppo numeroso e prenotazione facile." },
        { label: "Team building aziendale", prompt: "Scrivi una caption per proporre un team building aziendale paintball con focus su strategia, gioco di squadra e outdoor experience." },
        { label: "Promo weekend gruppi", prompt: "Scrivi una caption per una promo weekend dedicata ai gruppi paintball con posti limitati e CTA WhatsApp." },
        { label: "Torneo paintball", prompt: "Scrivi una caption per lanciare un torneo paintball con iscrizioni aperte e atmosfera competitiva." },
        { label: "Prima volta al paintball", prompt: "Scrivi una caption rassicurante per chi vuole provare il paintball per la prima volta, spiegando sicurezza e divertimento." },
      ],
      sports_reel_script: [
        { label: "Reel POV partita", prompt: "Crea un Reel POV partita paintball con hook forte, adrenalina, strategia di squadra e CTA prenotazione." },
        { label: "Sicurezza e attrezzatura", prompt: "Crea un Reel paintball per spiegare in modo chiaro sicurezza, attrezzatura e briefing iniziale." },
        { label: "Pacchetto amici", prompt: "Crea un Reel per promuovere un pacchetto paintball per gruppi di amici con visual dinamici e CTA weekend." },
        { label: "Modalita Caccia al Coniglio", prompt: "Crea un Reel per raccontare la modalita di gioco Caccia al Coniglio in modo divertente e prenotabile." },
        { label: "Evento aziendale outdoor", prompt: "Crea un Reel per un evento aziendale paintball con focus team building, outdoor e coordinamento." },
        { label: "Recensione gruppo", prompt: "Crea un Reel che mostri la recensione entusiasta di un gruppo dopo una partita paintball." },
      ],
      sports_promo: [
        { label: "Promo weekend gruppi", prompt: "Crea una promo paintball per gruppi weekend con valore chiaro, slot limitati e CTA prenotazione." },
        { label: "Compleanno bambini paintball", prompt: "Crea una promo commerciale per compleanni bambini paintball con format kids, briefing sicurezza e caparra semplice." },
        { label: "Addio al celibato paintball", prompt: "Crea una promo per addio al celibato paintball con energia alta, pacchetto gruppo e prenotazione rapida." },
        { label: "Torneo paintball", prompt: "Crea una promo per lanciare un torneo paintball con iscrizione team e premio finale." },
        { label: "Evento aziendale outdoor", prompt: "Crea una promo B2B per team building paintball con tono professionale e outdoor experience." },
        { label: "Pacchetto amici", prompt: "Crea una promo per un pacchetto amici paintball con focus su adrenalina, gioco di squadra e formula weekend." },
      ],
      sports_client_message: [
        { label: "Conferma prenotazione", prompt: "Scrivi un messaggio WhatsApp paintball per confermare una prenotazione con data, orario, numero partecipanti e arrivo anticipato." },
        { label: "Reminder evento", prompt: "Scrivi un reminder WhatsApp paintball pratico con abbigliamento consigliato, sicurezza e orario di arrivo." },
        { label: "Follow-up post partita", prompt: "Scrivi un follow-up WhatsApp post partita paintball per ringraziare il gruppo e proporre una nuova prenotazione." },
        { label: "Richiesta recensione", prompt: "Scrivi un messaggio WhatsApp per chiedere una recensione dopo un evento paintball di gruppo." },
        { label: "Proposta team building", prompt: "Scrivi un messaggio commerciale paintball per proporre un team building aziendale outdoor." },
        { label: "Proposta compleanno", prompt: "Scrivi un messaggio WhatsApp per proporre un compleanno paintball con formula bambini o ragazzi." },
      ],
    },
  },
  padel: {
    subcategory: "padel",
    label: "Padel",
    activeVerticalLabel: "Sports & Outdoor",
    positioning:
      "Community locale, prenotazioni campi, lezioni, tornei e abbonamenti ricorrenti con tono sportivo e premium.",
    contentPillars: [
      "prenotazioni campi",
      "lezioni",
      "tornei",
      "community",
      "slot infrasettimanali",
      "recensioni",
      "coach tips",
      "promo serali",
    ],
    offerTypes: [
      "pacchetti lezioni",
      "torneo del weekend",
      "promo slot infrasettimanali",
      "prenotazioni ricorrenti",
      "open day padel",
    ],
    crmSuggestions: [
      "Traccia disponibilita campi, lezioni e tornei per follow-up piu mirati.",
      "Segmenta clienti tra agonisti, principianti e gruppi ricorrenti.",
      "Usa reminder veloci per slot serali, tornei e lezioni prova.",
    ],
    crmTemplates: [
      { title: "Reminder prenotazione campo", prompt: "Scrivi un reminder WhatsApp per una prenotazione campo padel." },
      { title: "Proposta lezione prova", prompt: "Scrivi un messaggio per proporre una lezione prova padel." },
      { title: "Invito torneo", prompt: "Scrivi un messaggio per invitare a un torneo del weekend." },
    ],
    seasonalCampaigns: ["tornei primavera", "summer court slots", "autumn restart", "winter indoor routines"],
    socialCalendarIdeas: ["prenotazioni", "community", "coach tips", "tornei", "recensioni", "promo"],
    reelIdeas: ["punto spettacolare", "clip coach tip", "campo pieno la sera", "community challenge"],
    promoIdeas: ["lezione prova", "torneo weekend", "slot feriali", "mini-abbonamento campi"],
    clientMessages: ["reminder campo", "invito torneo", "lezione prova", "promo slot feriali"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: {},
  },
  calcetto: {
    subcategory: "calcetto",
    label: "Calcetto",
    activeVerticalLabel: "Sports & Outdoor",
    positioning:
      "Campionati amatoriali, prenotazioni campi, partite tra amici ed eventi con forte logica community e ricorrenza.",
    contentPillars: [
      "campionati",
      "prenotazioni campi",
      "partite tra amici",
      "eventi serali",
      "promo squadre",
      "recensioni",
      "community locale",
      "highlight match",
    ],
    offerTypes: [
      "campionato amatoriale",
      "promo squadre fisse",
      "slot serali",
      "evento aziendale",
      "pacchetto prenotazioni ricorrenti",
    ],
    crmSuggestions: [
      "Segmenta lead per squadre fisse, gruppi amici e aziende.",
      "Traccia disponibilita campi e preferenze orarie per riempire gli slot serali.",
      "Usa follow-up rapidi per campionati, partite del weekend e rinnovi squadra.",
    ],
    crmTemplates: [
      { title: "Reminder partita", prompt: "Scrivi un reminder WhatsApp per una partita di calcetto." },
      { title: "Slot serale libero", prompt: "Scrivi un messaggio per riempire uno slot serale libero di calcetto." },
      { title: "Invito campionato", prompt: "Scrivi un messaggio per proporre iscrizione a un campionato amatoriale." },
    ],
    seasonalCampaigns: ["summer nights", "campionato autunnale", "winter indoor league", "spring restart"],
    socialCalendarIdeas: ["community", "partite", "campionati", "promo", "recensioni", "eventi"],
    reelIdeas: ["gol spettacolare", "squadra del weekend", "campo pieno", "challenge amici"],
    promoIdeas: ["slot serali", "campionato", "azienda vs azienda", "squadra ricorrente"],
    clientMessages: ["reminder partita", "slot libero", "iscrizione campionato", "follow-up squadra"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: {},
  },
  tennis: {
    subcategory: "tennis",
    label: "Tennis",
    activeVerticalLabel: "Sports & Outdoor",
    positioning:
      "Lezioni, clinic, prenotazioni campi e tornei con tono tecnico ma accessibile e orientato a progressione e continuita.",
    contentPillars: [
      "lezioni",
      "clinic",
      "prenotazioni campi",
      "tornei",
      "progressione tecnica",
      "community",
      "recensioni",
      "promo prova",
    ],
    offerTypes: [
      "lezione prova",
      "mini clinic",
      "promo pacchetti lezioni",
      "torneo sociale",
      "prenotazioni weekend",
    ],
    crmSuggestions: [
      "Segmenta clienti tra lezioni, campi liberi e tornei.",
      "Usa follow-up diversi per principianti, intermedi e agonisti.",
      "Ricorda clinic e lezioni prova con messaggi brevi e professionali.",
    ],
    crmTemplates: [
      { title: "Lezione prova", prompt: "Scrivi un messaggio per invitare a una lezione prova tennis." },
      { title: "Reminder clinic", prompt: "Scrivi un reminder WhatsApp per un clinic tennis." },
      { title: "Invito torneo sociale", prompt: "Scrivi un invito per un torneo sociale tennis." },
    ],
    seasonalCampaigns: ["clinic primavera", "summer training", "autumn restart", "indoor winter"],
    socialCalendarIdeas: ["coach tips", "lezioni", "community", "tornei", "recensioni", "promo"],
    reelIdeas: ["tip tecnico rapido", "clinic day", "giocata elegante", "allenamento coach"],
    promoIdeas: ["lezione prova", "pacchetto lezioni", "torneo sociale", "clinic weekend"],
    clientMessages: ["lezione prova", "reminder clinic", "promo lezioni", "invito torneo"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: {},
  },
  go_kart: {
    subcategory: "go_kart",
    label: "Go Kart",
    activeVerticalLabel: "Sports & Outdoor",
    positioning:
      "Adrenalina pura, sfida tra amici, team building, eventi corporate e booking di gruppo con tono high-energy.",
    contentPillars: [
      "gare tra amici",
      "classifiche",
      "team building",
      "eventi corporate",
      "addii al celibato",
      "promo weekend",
      "sicurezza pista",
      "recensioni",
    ],
    offerTypes: [
      "gran premio amici",
      "evento aziendale",
      "addio al celibato",
      "promo gruppi weekend",
      "gara privata",
    ],
    crmSuggestions: [
      "Segmenta lead tra gruppi amici, aziende ed eventi privati.",
      "Traccia numero partecipanti, slot gara e richieste di pista esclusiva.",
      "Usa follow-up rapidi per weekend, team building e ricorrenze di gruppo.",
    ],
    crmTemplates: [
      { title: "Conferma gara", prompt: "Scrivi una conferma WhatsApp per una sessione go kart di gruppo." },
      { title: "Proposta team building", prompt: "Scrivi un messaggio per proporre un team building go kart." },
      { title: "Promo weekend gruppi", prompt: "Scrivi un messaggio per spingere una promo weekend gruppi go kart." },
    ],
    seasonalCampaigns: ["spring races", "summer adrenaline", "autumn corporate events", "winter indoor challenge"],
    socialCalendarIdeas: ["adrenalina", "classifiche", "eventi", "promo", "sicurezza", "recensioni"],
    reelIdeas: ["giro veloce", "partenza gara", "classifica finale", "dietro le quinte pista"],
    promoIdeas: ["gran premio amici", "corporate challenge", "promo weekend", "evento privato"],
    clientMessages: ["conferma gara", "promo gruppi", "team building", "recensione post evento"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: {},
  },
  softair: {
    subcategory: "softair",
    label: "Softair",
    activeVerticalLabel: "Sports & Outdoor",
    positioning:
      "Scenario game, strategia di squadra, sessioni su prenotazione, community competitiva ed eventi privati con forte immersione.",
    contentPillars: [
      "scenario game",
      "strategia di squadra",
      "sessioni private",
      "community competitiva",
      "attrezzatura",
      "sicurezza",
      "eventi speciali",
      "backstage",
    ],
    offerTypes: [
      "scenario game weekend",
      "sessione privata",
      "evento community",
      "team building tattico",
      "promo gruppi",
    ],
    crmSuggestions: [
      "Segmenta lead tra community abituale, gruppi privati e aziende.",
      "Tieni note su livello esperienza, attrezzatura e preferenze scenario.",
      "Usa follow-up mirati per eventi speciali, sessioni private e weekend.",
    ],
    crmTemplates: [
      { title: "Reminder sessione", prompt: "Scrivi un reminder WhatsApp per una sessione softair." },
      { title: "Promo evento community", prompt: "Scrivi un messaggio per promuovere un evento community softair." },
      { title: "Proposta sessione privata", prompt: "Scrivi un messaggio per proporre una sessione softair privata di gruppo." },
    ],
    seasonalCampaigns: ["weekend scenario", "summer battles", "autumn team day", "winter tactical sessions"],
    socialCalendarIdeas: ["strategia", "community", "attrezzatura", "sicurezza", "eventi", "promo"],
    reelIdeas: ["briefing iniziale", "scenario POV", "gear check", "community moments"],
    promoIdeas: ["scenario game weekend", "sessione privata", "team event", "promo gruppi"],
    clientMessages: ["reminder sessione", "promo community", "sessione privata", "richiesta conferma"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: {},
  },
};

export function getSportsKnowledgePack(
  subcategory?: string | null,
): SportsKnowledgePack {
  if (!subcategory) {
    return genericSportsPack;
  }

  return sportsKnowledgePacks[subcategory as SportsCenterSubcategory] ?? genericSportsPack;
}

export function getSportsKnowledgePackLabel(subcategory?: string | null) {
  return getSportsKnowledgePack(subcategory).label;
}

export function getSportsQuickTemplatesForSubcategory(
  type: AIContentType,
  subcategory?: string | null,
  fallbackTemplates: QuickTemplate[] = [],
) {
  const pack = getSportsKnowledgePack(subcategory);
  return pack.quickTemplates[type] ?? fallbackTemplates;
}
