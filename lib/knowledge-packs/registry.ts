import type { AIContentType, QuickTemplate } from "@/lib/business-verticals";
import type {
  KnowledgePack,
  KnowledgePackProfileInput,
  KnowledgePackTemplate,
  KnowledgePackVertical,
} from "@/lib/knowledge-packs/types";

function withPrompt(label: string, prompts: string[]): QuickTemplate[] {
  return prompts.map((prompt) => ({
    label,
    prompt,
  }));
}

function mergeQuickTemplates(...groups: Array<Partial<Record<AIContentType, QuickTemplate[]>>>) {
  return groups.reduce<Partial<Record<AIContentType, QuickTemplate[]>>>((acc, group) => {
    for (const [key, templates] of Object.entries(group) as Array<[AIContentType, QuickTemplate[]]>) {
      acc[key] = templates;
    }
    return acc;
  }, {});
}

function buildCrmTemplate(title: string, prompt: string, body?: string): KnowledgePackTemplate {
  return { title, prompt, body };
}

const fitnessBaseTemplates = {
  caption: [
    { label: "Promo iscrizione", prompt: "Scrivi una caption per spingere una promo iscrizione con CTA prova o consulenza." },
    { label: "Risultato cliente", prompt: "Scrivi una caption che racconti un risultato cliente in modo credibile e motivante." },
  ],
  reel: [
    { label: "Prima visita", prompt: "Crea un Reel per spiegare come funziona la prima visita in palestra o studio." },
    { label: "Allenamento rapido", prompt: "Crea un Reel con hook forte per mostrare una routine semplice e utile." },
  ],
  promo: [
    { label: "Promo stagionale", prompt: "Crea una promo fitness con urgenza chiara e valore percepito alto." },
    { label: "Recupero inattivi", prompt: "Crea una promo win-back per chi non si allena da tempo." },
  ],
} satisfies Partial<Record<AIContentType, QuickTemplate[]>>;

const beautyBaseTemplates = {
  hair_caption: [
    { label: "Nuovo look", prompt: "Scrivi una caption beauty-first per proporre un nuovo look con CTA prenotazione." },
    { label: "Prima/Dopo", prompt: "Scrivi una caption prima/dopo con tono aspirazionale e credibile." },
  ],
  hair_reel_script: [
    { label: "Trasformazione", prompt: "Crea un Reel per una trasformazione capelli con hook immediato e CTA booking." },
    { label: "Trend beauty", prompt: "Crea un Reel beauty moderno per mostrare un servizio in modo social-first." },
  ],
  hair_promo: [
    { label: "Promo trattamento", prompt: "Crea una promo per un trattamento beauty con urgenza morbida e booking diretto." },
    { label: "Last minute", prompt: "Crea una promo last minute per riempire uno slot libero oggi." },
  ],
  hair_client_message: [
    { label: "Reminder", prompt: "Scrivi un reminder appuntamento elegante e chiaro per WhatsApp." },
    { label: "Recupero cliente", prompt: "Scrivi un messaggio win-back per una cliente che non torna da settimane." },
  ],
} satisfies Partial<Record<AIContentType, QuickTemplate[]>>;

const sportsBaseTemplates = {
  sports_caption: [
    { label: "Promo weekend", prompt: "Scrivi una caption per riempire il weekend con CTA prenotazione rapida." },
    { label: "Gruppi ed eventi", prompt: "Scrivi una caption per promuovere gruppi, eventi o pacchetti dedicati." },
  ],
  sports_reel_script: [
    { label: "Esperienza sul campo", prompt: "Crea un Reel energico per mostrare l'esperienza sul campo o in struttura." },
    { label: "Highlight del weekend", prompt: "Crea un Reel che spinga prenotazioni weekend e senso di community." },
  ],
  sports_promo: [
    { label: "Promo slot liberi", prompt: "Crea una promo commerciale per riempire slot liberi di questa settimana." },
    { label: "Pacchetto gruppo", prompt: "Crea una promo per un pacchetto gruppo con CTA immediata." },
  ],
  sports_client_message: [
    { label: "Reminder prenotazione", prompt: "Scrivi un reminder WhatsApp per ricordare una prenotazione." },
    { label: "Recupero inattivi", prompt: "Scrivi un messaggio per riattivare clienti che non prenotano da tempo." },
  ],
} satisfies Partial<Record<AIContentType, QuickTemplate[]>>;

const knowledgePacks: KnowledgePack[] = [
  {
    id: "fitness-gym",
    slug: "gym",
    label: "Gym",
    vertical: "fitness",
    businessTypes: ["gym", "fitness_studio"],
    keywords: ["palestra", "gym", "sala pesi", "functional", "cross training", "workout"],
    positioning:
      "Allenamento strutturato, trasformazioni, prova gratuita, community locale e risultati concreti.",
    contentPillars: ["trasformazioni", "motivazione", "promo", "testimonial", "allenamento", "open day", "prova gratuita"],
    reelIdeas: ["tour struttura", "routine completa", "prima visita", "cliente che si allena", "coach tip rapido"],
    promoIdeas: ["open day", "promo iscrizione", "prova gratuita", "rientro inattivi", "abbonamento stagionale"],
    crmTemplates: [
      buildCrmTemplate("Follow-up lead", "Scrivi un messaggio per ricontattare un lead che ha chiesto info sulla palestra."),
      buildCrmTemplate("Recupero inattivi", "Scrivi un messaggio per riportare in palestra un cliente fermo da tempo."),
    ],
    calendarIdeas: ["trasformazioni", "motivazione", "promo", "alimentazione", "testimonial", "prova gratuita"],
    seasonalCampaigns: ["promo settembre", "shape up estiva", "winter restart", "open day stagionale"],
    assistantHints: [
      "Suggerisci campagne su prova gratuita, open day, rientro inattivi e piani di continuita.",
      "Controlla se mancano contenuti educativi, testimonial e offerte di conversione.",
    ],
    crmSuggestions: [
      "Segmenta lead, attivi e inattivi per follow-up diversi.",
      "Usa offerte semplici su prova gratuita o rientro assistito per aumentare le conversioni.",
    ],
    clientMessages: ["follow-up lead", "reminder prova", "recupero inattivi", "richiesta recensione"],
    offerTypes: ["prova gratuita", "open day", "promo iscrizione", "rientro inattivi"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: fitnessBaseTemplates,
  },
  {
    id: "fitness-personal-trainer",
    slug: "personal-trainer",
    label: "Personal Trainer",
    vertical: "fitness",
    businessTypes: ["personal_trainer"],
    keywords: ["personal trainer", "pt", "coach one to one", "allenamento personalizzato"],
    positioning:
      "Percorso individuale, attenzione personale, risultati misurabili e relazione diretta con il cliente.",
    contentPillars: ["consulenza personalizzata", "risultati cliente", "educazione", "routine su misura", "lifestyle", "call strategica"],
    reelIdeas: ["tip del coach", "prima consulenza", "errore comune", "routine personalizzata"],
    promoIdeas: ["consulenza iniziale", "pacchetto one to one", "check-in mensile", "offerta percorso 8 settimane"],
    crmTemplates: [
      buildCrmTemplate("Follow-up consulenza", "Scrivi un messaggio dopo una consulenza iniziale con proposta percorso personal trainer."),
      buildCrmTemplate("Check-in inattivo", "Scrivi un messaggio per riattivare un cliente PT fermo da qualche settimana."),
    ],
    calendarIdeas: ["educazione", "errori da evitare", "consulenza", "testimonianza", "lifestyle", "conversione"],
    seasonalCampaigns: ["reset post-vacanze", "challenge 30 giorni", "summer body realistico", "autumn restart"],
    assistantHints: [
      "Proponi funnel consulenza -> percorso -> check-in.",
      "Spingi su autorevolezza, relazione e personalizzazione piu che su prezzi bassi.",
    ],
    crmSuggestions: [
      "Tieni distinti i lead freddi da chi ha gia fatto una call o prova.",
      "Usa follow-up con obiettivo e prossima azione molto chiari.",
    ],
    clientMessages: ["follow-up consulenza", "check-in settimanale", "recupero cliente", "upsell percorso"],
    offerTypes: ["consulenza iniziale", "pacchetto PT", "check-in", "programma personalizzato"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: mergeQuickTemplates(fitnessBaseTemplates, {
      caption: withPrompt("Consulenza PT", ["Scrivi una caption per proporre una consulenza personal trainer senza risultare aggressivo."]),
      promo: withPrompt("Pacchetto PT", ["Crea una promo per un percorso personal trainer di 8 settimane con forte valore percepito."]),
    }),
  },
  {
    id: "fitness-yoga",
    slug: "yoga",
    label: "Yoga",
    vertical: "fitness",
    businessTypes: ["fitness_studio", "gym"],
    keywords: ["yoga", "vinyasa", "hatha", "yin", "mindfulness", "respiro"],
    positioning:
      "Benessere, equilibrio, respiro, consapevolezza e pratica guidata con tono calmo ma coinvolgente.",
    contentPillars: ["benefici della pratica", "routine dolce", "respiro", "benessere mentale", "lezione prova", "community"],
    reelIdeas: ["flow breve", "tip respirazione", "posizione del giorno", "ambiente studio"],
    promoIdeas: ["lezione prova", "pacchetto mensile", "evento benessere", "mini workshop"],
    crmTemplates: [
      buildCrmTemplate("Invito lezione prova", "Scrivi un messaggio per invitare a una lezione prova yoga."),
      buildCrmTemplate("Ritorno alla pratica", "Scrivi un messaggio delicato per invitare un cliente a tornare a praticare."),
    ],
    calendarIdeas: ["educazione", "rituale settimanale", "benessere", "community", "eventi", "promo soft"],
    seasonalCampaigns: ["reset di settembre", "rituale primaverile", "workshop benessere", "calma pre-estate"],
    assistantHints: [
      "Suggerisci contenuti educativi e inviti alla prova con tono rassicurante.",
      "Bilancia promozione e valore percepito senza comunicazione troppo aggressiva.",
    ],
    crmSuggestions: [
      "Usa follow-up morbidi e ricorrenti, piu orientati al benessere che all'urgenza.",
      "Segmenta chi cerca pratica costante da chi entra per eventi o workshop.",
    ],
    clientMessages: ["invito lezione prova", "reminder workshop", "ritorno alla pratica", "promo mensile"],
    offerTypes: ["lezione prova", "pacchetto yoga", "workshop", "evento benessere"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: mergeQuickTemplates(fitnessBaseTemplates, {
      caption: withPrompt("Lezione prova yoga", ["Scrivi una caption per invitare a una lezione prova yoga con tono calmo e rassicurante."]),
      reel: withPrompt("Flow yoga", ["Crea un Reel su un mini flow yoga con hook semplice e CTA prova."]),
    }),
  },
  {
    id: "fitness-pilates",
    slug: "pilates",
    label: "Pilates",
    vertical: "fitness",
    businessTypes: ["fitness_studio", "gym"],
    keywords: ["pilates", "postura", "core", "mobilita", "reformer", "matwork"],
    positioning:
      "Precisione, postura, controllo, benessere fisico e continuita con tono premium e accessibile.",
    contentPillars: ["postura", "core", "mobilita", "benefici reali", "lezione prova", "routine guidata"],
    reelIdeas: ["esercizio controllato", "errore frequente", "beneficio postura", "prima lezione"],
    promoIdeas: ["lezione prova", "pacchetto pilates", "promo posture reset", "mini percorso core"],
    crmTemplates: [
      buildCrmTemplate("Invito lezione pilates", "Scrivi un messaggio per invitare a una lezione prova pilates."),
      buildCrmTemplate("Follow-up postura", "Scrivi un messaggio per riproporre un percorso pilates a chi ha mostrato interesse per postura e mobilita."),
    ],
    calendarIdeas: ["educazione", "benefici", "routine", "postura", "promo", "testimonianze"],
    seasonalCampaigns: ["reset postura", "back to routine", "summer core", "autumn mobility"],
    assistantHints: [
      "Spingi su risultati concreti come postura, controllo e continuita.",
      "Suggerisci campagne educative con CTA verso lezione prova o percorso breve.",
    ],
    crmSuggestions: [
      "Segmenta chi cerca benessere, postura, recupero o attivita dolce.",
      "Valorizza continuita e percezione premium del percorso.",
    ],
    clientMessages: ["invito lezione prova", "follow-up postura", "promo percorso", "reminder lezione"],
    offerTypes: ["lezione prova", "pacchetto pilates", "percorso core", "promo postura"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: mergeQuickTemplates(fitnessBaseTemplates, {
      caption: withPrompt("Postura e pilates", ["Scrivi una caption per far percepire il valore del pilates sulla postura."]),
      promo: withPrompt("Percorso pilates", ["Crea una promo per un mini percorso pilates con CTA lezione prova."]),
    }),
  },
  {
    id: "beauty-hair-salon",
    slug: "hair-salon",
    label: "Hair Salon",
    vertical: "beauty",
    businessTypes: ["hair_salon", "hair_stylist"],
    keywords: ["capelli", "balayage", "colore", "piega", "taglio", "salone"],
    positioning:
      "Esperienza salone moderna, trasformazione, cura del dettaglio, prenotazione facile e risultato desiderabile.",
    contentPillars: ["prima/dopo", "colore", "balayage", "trattamenti", "trend", "recensioni", "backstage"],
    reelIdeas: ["trasformazione", "prima/dopo", "rituale colore", "dietro le quinte salone"],
    promoIdeas: ["promo colore", "piega last minute", "trattamento premium", "refresh look stagionale"],
    crmTemplates: [
      buildCrmTemplate("Reminder appuntamento", "Scrivi un reminder appuntamento elegante e chiaro per una cliente del salone."),
      buildCrmTemplate("Richiesta recensione", "Scrivi un messaggio per chiedere una recensione dopo un servizio hair premium."),
    ],
    calendarIdeas: ["prima/dopo", "promo", "trend", "backstage", "trasformazioni", "fidelizzazione"],
    seasonalCampaigns: ["nuovo look estate", "refresh colore autunnale", "hair reset di stagione", "promo eventi speciali"],
    assistantHints: [
      "Suggerisci booking diretto, contenuti visuali e promozione di trasformazioni.",
      "Alterna ispirazione, prova sociale e contenuti di conversione.",
    ],
    crmSuggestions: [
      "Usa follow-up post servizio, reminder e win-back per clienti che spariscono per settimane.",
      "Segmenta per trattamento, frequenza e valore medio.",
    ],
    clientMessages: ["reminder appuntamento", "richiesta recensione", "promo trattamento", "win-back cliente"],
    offerTypes: ["promo colore", "promo piega", "trattamento premium", "refresh look"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: beautyBaseTemplates,
  },
  {
    id: "beauty-barber-shop",
    slug: "barber-shop",
    label: "Barber Shop",
    vertical: "beauty",
    businessTypes: ["barber_shop"],
    keywords: ["barber", "fade", "beard", "grooming", "taglio uomo", "rasatura"],
    positioning:
      "Stile deciso, precisione, grooming e identita maschile con booking rapido e community locale.",
    contentPillars: ["fade", "barba", "grooming", "trasformazioni uomo", "stile", "recensioni", "slot veloci"],
    reelIdeas: ["barber fade", "prima/dopo barba", "routine grooming", "dettaglio taglio"],
    promoIdeas: ["taglio + barba", "last minute uomo", "pacchetto grooming", "promo settimana"],
    crmTemplates: [
      buildCrmTemplate("Reminder taglio", "Scrivi un reminder appuntamento barber con tono diretto e pulito."),
      buildCrmTemplate("Recupero cliente", "Scrivi un messaggio win-back per un cliente barber che non prenota da tempo."),
    ],
    calendarIdeas: ["trasformazioni", "grooming tips", "promo", "recensioni", "backstage", "stile uomo"],
    seasonalCampaigns: ["grooming estivo", "back to office look", "holiday cleanup", "barber week"],
    assistantHints: [
      "Suggerisci contenuti piu decisi, visuali e orientati a booking rapido.",
      "Valorizza taglio, barba, stile e routine uomo.",
    ],
    crmSuggestions: [
      "Usa reminder brevi e offerte leggere su ritorno ricorrente.",
      "Segmenta chi prenota solo taglio da chi aggiunge barba o servizi premium.",
    ],
    clientMessages: ["reminder taglio", "promo grooming", "recupero cliente", "richiesta recensione"],
    offerTypes: ["taglio + barba", "promo grooming", "slot veloci", "servizio premium"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: mergeQuickTemplates(beautyBaseTemplates, {
      hair_reel_script: withPrompt("Barber fade", ["Crea un Reel per un barber fade con tono moderno e CTA booking."]),
      hair_promo: withPrompt("Taglio + barba", ["Crea una promo per taglio + barba con tono premium ma diretto."]),
    }),
  },
  {
    id: "beauty-center",
    slug: "beauty-center",
    label: "Beauty Center",
    vertical: "beauty",
    businessTypes: ["hair_salon", "hair_stylist"],
    keywords: ["beauty", "estetica", "viso", "massaggio", "trattamento viso", "benessere", "spa"],
    positioning:
      "Benessere, cura personale, trattamenti premium e risultato percepito con tono elegante e rassicurante.",
    contentPillars: ["trattamenti", "benefici", "risultati", "rituali benessere", "promo", "recensioni"],
    reelIdeas: ["rituale trattamento", "prima/dopo delicato", "momento relax", "dettagli cabina"],
    promoIdeas: ["promo trattamento viso", "rituale benessere", "pacchetto relax", "gift experience"],
    crmTemplates: [
      buildCrmTemplate("Reminder trattamento", "Scrivi un reminder appuntamento per un beauty center con tono elegante."),
      buildCrmTemplate("Recupero cliente benessere", "Scrivi un messaggio per riportare una cliente a fare un trattamento benessere."),
    ],
    calendarIdeas: ["educazione", "benefici", "promo", "rituali", "recensioni", "fidelizzazione"],
    seasonalCampaigns: ["summer glow", "reset autunnale", "gift season", "rituale primavera"],
    assistantHints: [
      "Suggerisci contenuti che facciano percepire atmosfera, cura e valore del trattamento.",
      "Usa promozione morbida e booking guidato.",
    ],
    crmSuggestions: [
      "Segmenta per trattamento, frequenza, benessere e acquisti regalo.",
      "Punta su reminder e ritorno ciclico.",
    ],
    clientMessages: ["reminder trattamento", "promo benessere", "recupero cliente", "gift experience"],
    offerTypes: ["trattamento viso", "rituale benessere", "pacchetto relax", "gift card"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: mergeQuickTemplates(beautyBaseTemplates, {
      hair_caption: withPrompt("Beauty treatment", ["Scrivi una caption per un trattamento beauty premium con CTA prenotazione."]),
      hair_promo: withPrompt("Pacchetto benessere", ["Crea una promo per un pacchetto beauty center orientato al relax e al booking."]),
    }),
  },
  {
    id: "beauty-nail-studio",
    slug: "nail-studio",
    label: "Nail Studio",
    vertical: "beauty",
    businessTypes: ["hair_salon", "hair_stylist"],
    keywords: ["nail", "unghie", "manicure", "semipermanente", "nail art", "pedicure"],
    positioning:
      "Cura dell'immagine, precisione, dettagli e prenotazioni ricorrenti con tono social e visivo.",
    contentPillars: ["nail art", "prima/dopo", "colori stagione", "ritocchi", "promo", "recensioni"],
    reelIdeas: ["nail art reveal", "colore del mese", "processo manicure", "prima/dopo unghie"],
    promoIdeas: ["promo semipermanente", "ritocco veloce", "nail art premium", "combo mani-piedi"],
    crmTemplates: [
      buildCrmTemplate("Reminder refill", "Scrivi un reminder per un refill o ritocco unghie con tono professionale."),
      buildCrmTemplate("Promo colore stagione", "Scrivi un messaggio per proporre un nuovo colore o una nail art stagionale."),
    ],
    calendarIdeas: ["trend colori", "prima/dopo", "promo", "ritocchi", "stagionalita", "recensioni"],
    seasonalCampaigns: ["summer colors", "holiday nails", "autumn palette", "spring refresh"],
    assistantHints: [
      "Spingi su componenti visuali, ricorrenza del servizio e trend stagionali.",
      "Alterna contenuti aspirazionali a reminder di refill e prenotazione.",
    ],
    crmSuggestions: [
      "Segmenta clienti per refill, nail art premium e frequenza prenotazione.",
      "Usa reminder ricorrenti e promozione stagionale legata ai colori.",
    ],
    clientMessages: ["reminder refill", "promo stagione", "ritorno cliente", "nuova nail art"],
    offerTypes: ["semipermanente", "refill", "nail art premium", "combo mani-piedi"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: mergeQuickTemplates(beautyBaseTemplates, {
      hair_caption: withPrompt("Nuovo set unghie", ["Scrivi una caption per promuovere un nuovo set unghie con forte impatto visivo."]),
      hair_promo: withPrompt("Promo refill", ["Crea una promo per refill o ritocco unghie con CTA prenotazione."]),
    }),
  },
  {
    id: "sports-paintball",
    slug: "paintball",
    label: "Paintball",
    vertical: "sports",
    businessTypes: ["sports_center"],
    aliases: ["paintball"],
    keywords: ["paintball", "team building", "compleanno", "addio al celibato", "outdoor", "battle"],
    positioning:
      "Adrenalina, gioco di squadra, strategia, sicurezza, esperienza outdoor e prenotazioni di gruppo per eventi e weekend.",
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
    crmTemplates: [
      buildCrmTemplate("Conferma prenotazione", "Scrivi un messaggio WhatsApp paintball per confermare data, orario, partecipanti e arrivo anticipato."),
      buildCrmTemplate("Reminder evento", "Scrivi un reminder pratico paintball con abbigliamento, sicurezza e arrivo anticipato."),
      buildCrmTemplate("Follow-up post partita", "Scrivi un follow-up post partita per proporre una nuova prenotazione al gruppo."),
      buildCrmTemplate("Richiesta recensione", "Scrivi una richiesta recensione dopo un evento paintball di gruppo."),
      buildCrmTemplate("Proposta team building", "Scrivi una proposta commerciale per un team building aziendale paintball."),
      buildCrmTemplate("Proposta compleanno", "Scrivi un messaggio per proporre un compleanno paintball bambini o ragazzi."),
      buildCrmTemplate("Proposta addio al celibato", "Scrivi un messaggio per proporre un addio al celibato paintball con slot weekend."),
    ],
    calendarIdeas: ["promo", "educazione", "intrattenimento", "recensioni", "backstage", "eventi", "sicurezza", "conversione prenotazioni"],
    seasonalCampaigns: ["promo weekend gruppi", "compleanni primavera-estate", "team building autunnale", "torneo stagionale", "eventi privati pre-festivi"],
    assistantHints: [
      "Suggerisci campagne per compleanni, team building, addii al celibato e prenotazioni weekend.",
      "Quando analizzi il business, valuta se mancano contenuti su sicurezza, FAQ prima volta e prova sociale di gruppo.",
    ],
    crmSuggestions: [
      "Segmenta lead per compleanni, addii al celibato, team building e gruppi amici.",
      "Traccia caparre, slot orari e numero partecipanti per follow-up piu veloci.",
    ],
    clientMessages: ["conferma prenotazione", "reminder evento", "follow-up post partita", "richiesta recensione", "proposta team building", "proposta compleanno", "proposta addio al celibato"],
    offerTypes: ["pacchetto compleanno kids", "addio al celibato di gruppo", "team building outdoor", "promo weekend gruppi", "torneo paintball", "evento privato aziendale"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok", "WhatsApp follow-up"],
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
  {
    id: "sports-padel",
    slug: "padel",
    label: "Padel",
    vertical: "sports",
    businessTypes: ["sports_center"],
    aliases: ["padel"],
    keywords: ["padel", "campo", "torneo", "coach", "lezione", "match"],
    positioning: "Community locale, prenotazioni campi, lezioni, tornei e slot ricorrenti con tono sportivo e premium.",
    contentPillars: ["prenotazioni campi", "lezioni", "tornei", "community", "slot infrasettimanali", "recensioni", "coach tips", "promo serali"],
    reelIdeas: ["punto spettacolare", "clip coach tip", "campo pieno la sera", "community challenge"],
    promoIdeas: ["lezione prova", "torneo weekend", "slot feriali", "mini-abbonamento campi"],
    crmTemplates: [
      buildCrmTemplate("Reminder campo", "Scrivi un reminder WhatsApp per una prenotazione campo padel."),
      buildCrmTemplate("Lezione prova", "Scrivi un messaggio per proporre una lezione prova padel."),
      buildCrmTemplate("Invito torneo", "Scrivi un messaggio per invitare a un torneo del weekend."),
    ],
    calendarIdeas: ["prenotazioni", "community", "coach tips", "tornei", "recensioni", "promo"],
    seasonalCampaigns: ["tornei primavera", "summer court slots", "autumn restart", "winter indoor routines"],
    assistantHints: [
      "Suggerisci campagne per slot feriali, community e tornei weekend.",
      "Valuta se mancano contenuti educativi e proof di community.",
    ],
    crmSuggestions: [
      "Segmenta clienti tra agonisti, principianti e gruppi ricorrenti.",
      "Usa reminder veloci per slot serali, tornei e lezioni prova.",
    ],
    clientMessages: ["reminder campo", "invito torneo", "lezione prova", "promo slot feriali"],
    offerTypes: ["pacchetti lezioni", "torneo weekend", "promo slot infrasettimanali", "prenotazioni ricorrenti", "open day padel"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: sportsBaseTemplates,
  },
  {
    id: "sports-calcetto",
    slug: "calcetto",
    label: "Calcetto",
    vertical: "sports",
    businessTypes: ["sports_center"],
    aliases: ["calcetto"],
    keywords: ["calcetto", "campo", "squadra", "campionato", "partita", "futsal"],
    positioning: "Campionati amatoriali, prenotazioni campi e partite tra amici con forte logica community e ricorrenza.",
    contentPillars: ["campionati", "prenotazioni campi", "partite tra amici", "eventi serali", "promo squadre", "recensioni", "community locale", "highlight match"],
    reelIdeas: ["gol spettacolare", "squadra del weekend", "campo pieno", "challenge amici"],
    promoIdeas: ["slot serali", "campionato", "azienda vs azienda", "squadra ricorrente"],
    crmTemplates: [
      buildCrmTemplate("Reminder partita", "Scrivi un reminder WhatsApp per una partita di calcetto."),
      buildCrmTemplate("Slot serale libero", "Scrivi un messaggio per riempire uno slot serale libero di calcetto."),
      buildCrmTemplate("Invito campionato", "Scrivi un messaggio per proporre iscrizione a un campionato amatoriale."),
    ],
    calendarIdeas: ["community", "partite", "campionati", "promo", "recensioni", "eventi"],
    seasonalCampaigns: ["summer nights", "campionato autunnale", "winter indoor league", "spring restart"],
    assistantHints: [
      "Spingi su squadre ricorrenti, campionati e slot serali.",
      "Suggerisci campagne locali e contenuti community-driven.",
    ],
    crmSuggestions: [
      "Segmenta lead per squadre fisse, gruppi amici e aziende.",
      "Traccia disponibilita campi e preferenze orarie per riempire gli slot serali.",
    ],
    clientMessages: ["reminder partita", "slot libero", "iscrizione campionato", "follow-up squadra"],
    offerTypes: ["campionato amatoriale", "promo squadre fisse", "slot serali", "evento aziendale", "pacchetto ricorrente"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: sportsBaseTemplates,
  },
  {
    id: "sports-tennis",
    slug: "tennis",
    label: "Tennis",
    vertical: "sports",
    businessTypes: ["sports_center"],
    aliases: ["tennis"],
    keywords: ["tennis", "clinic", "lezione", "coach", "torneo", "campo"],
    positioning: "Lezioni, clinic, prenotazioni campi e tornei con tono tecnico ma accessibile e orientato alla progressione.",
    contentPillars: ["lezioni", "clinic", "prenotazioni campi", "tornei", "progressione tecnica", "community", "recensioni", "promo prova"],
    reelIdeas: ["tip tecnico rapido", "clinic day", "giocata elegante", "allenamento coach"],
    promoIdeas: ["lezione prova", "pacchetto lezioni", "torneo sociale", "clinic weekend"],
    crmTemplates: [
      buildCrmTemplate("Lezione prova", "Scrivi un messaggio per invitare a una lezione prova tennis."),
      buildCrmTemplate("Reminder clinic", "Scrivi un reminder WhatsApp per un clinic tennis."),
      buildCrmTemplate("Invito torneo sociale", "Scrivi un invito per un torneo sociale tennis."),
    ],
    calendarIdeas: ["coach tips", "lezioni", "community", "tornei", "recensioni", "promo"],
    seasonalCampaigns: ["clinic primavera", "summer training", "autumn restart", "indoor winter"],
    assistantHints: [
      "Bilancia autorevolezza tecnica e comunicazione accessibile.",
      "Suggerisci funnel lezione prova -> pacchetto lezioni -> torneo o clinic.",
    ],
    crmSuggestions: [
      "Segmenta clienti tra lezioni, campi liberi e tornei.",
      "Usa follow-up diversi per principianti, intermedi e agonisti.",
    ],
    clientMessages: ["lezione prova", "reminder clinic", "promo lezioni", "invito torneo"],
    offerTypes: ["lezione prova", "mini clinic", "promo pacchetti lezioni", "torneo sociale", "prenotazioni weekend"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: sportsBaseTemplates,
  },
  {
    id: "sports-softair",
    slug: "softair",
    label: "Softair",
    vertical: "sports",
    businessTypes: ["sports_center"],
    aliases: ["softair"],
    keywords: ["softair", "scenario", "gear", "tattico", "sessione privata", "community"],
    positioning: "Scenario game, strategia di squadra, sessioni su prenotazione e community competitiva ad alta immersione.",
    contentPillars: ["scenario game", "strategia di squadra", "sessioni private", "community competitiva", "attrezzatura", "sicurezza", "eventi speciali", "backstage"],
    reelIdeas: ["briefing iniziale", "scenario POV", "gear check", "community moments"],
    promoIdeas: ["scenario game weekend", "sessione privata", "team event", "promo gruppi"],
    crmTemplates: [
      buildCrmTemplate("Reminder sessione", "Scrivi un reminder WhatsApp per una sessione softair."),
      buildCrmTemplate("Promo evento community", "Scrivi un messaggio per promuovere un evento community softair."),
      buildCrmTemplate("Proposta sessione privata", "Scrivi un messaggio per proporre una sessione softair privata di gruppo."),
    ],
    calendarIdeas: ["strategia", "community", "attrezzatura", "sicurezza", "eventi", "promo"],
    seasonalCampaigns: ["weekend scenario", "summer battles", "autumn team day", "winter tactical sessions"],
    assistantHints: [
      "Suggerisci contenuti su scenario, gear, community ed eventi speciali.",
      "Usa una comunicazione immersiva ma sempre chiara su sicurezza e organizzazione.",
    ],
    crmSuggestions: [
      "Segmenta lead tra community abituale, gruppi privati e aziende.",
      "Tieni note su livello esperienza, attrezzatura e preferenze scenario.",
    ],
    clientMessages: ["reminder sessione", "promo community", "sessione privata", "richiesta conferma"],
    offerTypes: ["scenario game weekend", "sessione privata", "evento community", "team building tattico", "promo gruppi"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: sportsBaseTemplates,
  },
  {
    id: "sports-go-kart",
    slug: "go-kart",
    label: "Go Kart",
    vertical: "sports",
    businessTypes: ["sports_center"],
    aliases: ["go_kart", "gokart", "go kart"],
    keywords: ["go kart", "gokart", "gara", "pista", "classifica", "adrenalina"],
    positioning: "Adrenalina pura, sfida tra amici, team building ed eventi corporate con booking di gruppo ad alto impatto.",
    contentPillars: ["gare tra amici", "classifiche", "team building", "eventi corporate", "addii al celibato", "promo weekend", "sicurezza pista", "recensioni"],
    reelIdeas: ["giro veloce", "partenza gara", "classifica finale", "dietro le quinte pista"],
    promoIdeas: ["gran premio amici", "corporate challenge", "promo weekend", "evento privato"],
    crmTemplates: [
      buildCrmTemplate("Conferma gara", "Scrivi una conferma WhatsApp per una sessione go kart di gruppo."),
      buildCrmTemplate("Proposta team building", "Scrivi un messaggio per proporre un team building go kart."),
      buildCrmTemplate("Promo weekend gruppi", "Scrivi un messaggio per spingere una promo weekend gruppi go kart."),
    ],
    calendarIdeas: ["adrenalina", "classifiche", "eventi", "promo", "sicurezza", "recensioni"],
    seasonalCampaigns: ["spring races", "summer adrenaline", "autumn corporate events", "winter indoor challenge"],
    assistantHints: [
      "Spingi su competizione, gruppi, classifiche e uso corporate o ricorrenze di gruppo.",
      "Controlla se mancano contenuti su sicurezza pista e prove sociali post evento.",
    ],
    crmSuggestions: [
      "Segmenta lead tra gruppi amici, aziende ed eventi privati.",
      "Traccia numero partecipanti, slot gara e richieste di pista esclusiva.",
    ],
    clientMessages: ["conferma gara", "promo gruppi", "team building", "recensione post evento"],
    offerTypes: ["gran premio amici", "evento aziendale", "addio al celibato", "promo gruppi weekend", "gara privata"],
    supportedCalendarFormats: ["Post Instagram", "Reel", "Story", "TikTok"],
    quickTemplates: sportsBaseTemplates,
  },
];

const genericPacks: Record<KnowledgePackVertical, KnowledgePack> = {
  fitness: knowledgePacks.find((pack) => pack.id === "fitness-gym")!,
  beauty: knowledgePacks.find((pack) => pack.id === "beauty-hair-salon")!,
  sports: {
    ...knowledgePacks.find((pack) => pack.id === "sports-padel")!,
    id: "sports-generic",
    slug: "sports-generic",
    label: "Sports & Outdoor",
    keywords: ["sport", "outdoor", "gruppi", "eventi"],
    positioning:
      "Esperienza di gruppo, prenotazioni semplici, attivita outdoor e contenuti orientati a eventi, community e conversione.",
    contentPillars: ["promo weekend", "prenotazioni", "gruppi ed eventi", "recensioni clienti", "backstage", "community locale"],
    calendarIdeas: ["promo", "community", "educazione", "eventi", "backstage", "conversione prenotazioni"],
  },
};

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function collectProfileText(profile: KnowledgePackProfileInput | null | undefined) {
  return [
    profile?.business_name,
    profile?.services,
    profile?.target_audience,
    profile?.unique_selling_points,
    profile?.sports_subcategory,
    profile?.salon_specialties,
    profile?.salon_style,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreByKeywords(pack: KnowledgePack, source: string) {
  return (pack.keywords ?? []).reduce((score, keyword) => {
    return source.includes(keyword.toLowerCase()) ? score + 1 : score;
  }, 0);
}

function resolveVertical(profile?: KnowledgePackProfileInput | null): KnowledgePackVertical {
  const businessType = normalize(profile?.business_type);

  if (businessType === "sports_center") {
    return "sports";
  }

  if (["hair_salon", "barber_shop", "hair_stylist"].includes(businessType)) {
    return "beauty";
  }

  return "fitness";
}

export function getKnowledgePackRegistry() {
  return knowledgePacks;
}

export function getKnowledgePacksByVertical(vertical: KnowledgePackVertical) {
  return knowledgePacks.filter((pack) => pack.vertical === vertical);
}

export function getKnowledgePackBySlug(slug?: string | null) {
  const normalizedSlug = normalize(slug);
  if (!normalizedSlug) {
    return null;
  }

  return (
    knowledgePacks.find(
      (pack) =>
        pack.slug === normalizedSlug ||
        pack.id === normalizedSlug ||
        pack.aliases?.some((alias) => normalize(alias) === normalizedSlug),
    ) ?? null
  );
}

export function resolveKnowledgePack(profile?: KnowledgePackProfileInput | null): KnowledgePack {
  const vertical = resolveVertical(profile);
  const source = collectProfileText(profile);
  const businessType = normalize(profile?.business_type);

  if (vertical === "sports") {
    const directSports = getKnowledgePackBySlug(profile?.sports_subcategory);
    if (directSports) {
      return directSports;
    }
  }

  const candidates = getKnowledgePacksByVertical(vertical).filter((pack) => {
    return pack.businessTypes.includes(businessType) || pack.businessTypes.length === 0;
  });

  let bestMatch: KnowledgePack | null = null;
  let bestScore = 0;

  for (const pack of candidates) {
    const score = scoreByKeywords(pack, source);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pack;
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  if (vertical === "beauty" && businessType === "barber_shop") {
    return getKnowledgePackBySlug("barber-shop") ?? genericPacks.beauty;
  }

  if (vertical === "fitness" && businessType === "personal_trainer") {
    return getKnowledgePackBySlug("personal-trainer") ?? genericPacks.fitness;
  }

  return genericPacks[vertical];
}
