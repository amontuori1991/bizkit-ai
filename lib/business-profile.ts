import {
  getBusinessTypeLabel,
  getSportsSubcategoryLabel,
  isHairBusinessType,
  isSportsBusinessType,
  type AIContentType,
} from "@/lib/business-verticals";

export type BusinessProfile = {
  id: string;
  user_id: string;
  is_primary: boolean;
  business_name: string | null;
  business_type: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  instagram: string | null;
  tone_of_voice: string | null;
  target_audience: string | null;
  services: string | null;
  unique_selling_points: string | null;
  preferred_cta: string | null;
  preferred_hashtags: string | null;
  sports_subcategory: string | null;
  salon_specialties: string | null;
  booking_link: string | null;
  opening_hours: string | null;
  stylist_names: string | null;
  products_used: string | null;
  salon_style: string | null;
  created_at: string;
};

export function pickPrimaryBusinessProfile(profiles: BusinessProfile[] | null | undefined) {
  if (!profiles || profiles.length === 0) {
    return null;
  }

  return (
    profiles.find((profile) => profile.is_primary) ??
    [...profiles].sort((first, second) => {
      return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
    })[0] ??
    null
  );
}

function formatValue(label: string, value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  return `${label}: ${value.trim()}`;
}

export function isBusinessProfileComplete(profile: BusinessProfile | null) {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.business_name?.trim() &&
      profile.business_type?.trim() &&
      profile.city?.trim() &&
      profile.tone_of_voice?.trim() &&
      profile.target_audience?.trim(),
  );
}

export function buildBusinessProfileContext(profile: BusinessProfile | null) {
  if (!profile) {
    return "";
  }

  const lines = [
    formatValue("Nome attivita", profile.business_name),
    formatValue("Tipo di business", getBusinessTypeLabel(profile.business_type)),
    formatValue("Citta", profile.city),
    formatValue("Indirizzo", profile.address),
    formatValue("Sito web", profile.website),
    formatValue("Instagram", profile.instagram),
    formatValue("Tone of voice", profile.tone_of_voice),
    formatValue("Target audience", profile.target_audience),
    formatValue("Servizi principali", profile.services),
    formatValue("Unique selling points", profile.unique_selling_points),
    formatValue("CTA preferita", profile.preferred_cta),
    formatValue("Hashtag preferiti", profile.preferred_hashtags),
    formatValue(
      "Sottocategoria centro sportivo",
      profile.sports_subcategory ? getSportsSubcategoryLabel(profile.sports_subcategory) : null,
    ),
    formatValue("Specialita salone", profile.salon_specialties),
    formatValue("Link prenotazione", profile.booking_link),
    formatValue("Orari apertura", profile.opening_hours),
    formatValue("Stylist del team", profile.stylist_names),
    formatValue("Prodotti usati", profile.products_used),
    formatValue("Stile salone", profile.salon_style),
  ].filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  return `Usa questo contesto business come base obbligatoria per ogni output:\n${lines.join("\n")}`;
}

function getSportsSubcategoryAngle(profile: BusinessProfile | null) {
  if (!profile || !isSportsBusinessType(profile.business_type)) {
    return "";
  }

  const subcategory = profile.sports_subcategory?.trim();
  const subcategoryLabel = getSportsSubcategoryLabel(subcategory);
  const instructions: Partial<Record<string, string>> = {
    paintball:
      "Per paintball enfatizza adrenalina, gioco di squadra, strategia, sicurezza, divertimento outdoor, eventi di gruppo, compleanni, addii al celibato, team building e prenotazioni weekend. Alterna contenuti tra promo, FAQ prima volta, sicurezza e attrezzatura, dietro le quinte, modalita di gioco, recensioni clienti e backstage reale.",
    softair:
      "Per softair enfatizza scenario game, team building, sessioni su prenotazione, eventi privati e community competitiva.",
    laser_tag:
      "Per laser tag enfatizza compleanni, gruppi amici, famiglie, eventi indoor e prenotazioni rapide.",
    padel:
      "Per padel enfatizza lezioni, tornei, prenotazioni campi, community locale e slot infrasettimanali.",
    calcetto:
      "Per calcetto enfatizza campionati, prenotazioni campi, partite tra amici, eventi aziendali e promo serali.",
    tennis:
      "Per tennis enfatizza lezioni, clinic, prenotazioni campi, tornei e progressione tecnica.",
    beach_volley:
      "Per beach volley enfatizza tornei estivi, gruppi amici, eventi outdoor e atmosfera social.",
    adventure_park:
      "Per adventure park enfatizza famiglie, gruppi, scuole, esperienze outdoor e team building.",
    go_kart:
      "Per go kart enfatizza gare tra amici, addii al celibato, team building, eventi corporate e adrenalina pura.",
    multisport:
      "Per multisport enfatizza versatilita, attivita per gruppi, eventi stagionali, tornei e prenotazioni ricorrenti.",
  };

  return [
    `Questo business e un centro sportivo/outdoor nella sottocategoria ${subcategoryLabel}.`,
    instructions[subcategory ?? ""] ??
      "Adatta copy, CTA e offerte alla sottocategoria scelta, puntando su prenotazioni, gruppi, eventi e ricorrenze locali.",
  ].join("\n");
}

function getFitnessPrompt(type: AIContentType) {
  const shared = [
    "Scrivi in italiano.",
    "Mantieni un tono professionale, premium, concreto e orientato a conversione locale.",
    "Usa emoji intelligenti e mai eccessive: da 0 a 3, solo se aiutano leggibilita e tono.",
    "Evita frasi generiche, promesse irrealistiche, linguaggio artificiale e formule da spam.",
    "Se il profilo business contiene CTA, USP o hashtag preferiti, integrali in modo naturale.",
    "Genera sempre tre versioni distinte: short, medium e long.",
    "Ogni versione deve essere pronta da usare, con spaziatura chiara, CTA forte e leggibilita mobile.",
    "Non aggiungere testo fuori dal formato richiesto.",
  ];

  const typeInstruction: Record<string, string> = {
    caption:
      "Sei un copywriter senior per business fitness. Genera caption Instagram premium, credibili e orientate a commenti, DM o prova gratuita.",
    reel:
      "Sei un content strategist senior per business fitness. Genera contenuti Reel con hook forte, ritmo chiaro, idea visiva e CTA commerciale naturale.",
    promo:
      "Sei un consulente marketing senior per business fitness. Genera promo commerciali credibili, desiderabili e facili da lanciare su social, WhatsApp o email.",
  };

  return [typeInstruction[type], ...shared].filter(Boolean).join("\n\n");
}

function getHairPrompt(type: AIContentType) {
  const shared = [
    "Scrivi in italiano.",
    "Usa un tone of voice moderno, beauty/fashion oriented, emozionale e social-first.",
    "Usa emoji smart e fashion/beauty quando migliorano il ritmo del testo: massimo 3 per variante.",
    "Le CTA devono orientare a booking, DM, WhatsApp o prenotazione diretta.",
    "Integra hashtag beauty/hair in modo naturale quando utili.",
    "Genera sempre tre versioni distinte: short, medium e long.",
    "Ogni versione deve avere hook piu virali, spacing migliore e output pronto per Instagram o TikTok.",
    "Non aggiungere testo fuori dal formato richiesto.",
  ];

  const typeInstruction: Record<string, string> = {
    hair_caption:
      "Sei un copywriter senior per saloni parrucchieri, barber shop e hair stylist. Genera caption Instagram premium, aspirazionali e orientate a prenotazioni.",
    hair_reel_script:
      "Sei un social strategist beauty specializzato in hair. Genera Reel script con hook virali, ritmo rapido, prima/dopo o trasformazione, e CTA booking.",
    hair_promo:
      "Sei un marketing strategist per saloni beauty. Genera promo trattamenti, taglio, colore o barber service con forte valore percepito e booking immediato.",
    hair_client_message:
      "Sei un customer care copywriter per saloni. Genera messaggi WhatsApp clienti eleganti, chiari e orientati a prenotazione o fidelizzazione.",
    hair_appointment_reminder:
      "Sei un customer experience specialist per saloni. Genera reminder appuntamento chiari, caldi e professionali.",
    hair_review_request:
      "Sei un retention strategist per saloni. Genera una richiesta recensione breve, naturale e raffinata.",
    hair_stories_idea:
      "Sei un content creator beauty. Genera idee Stories Instagram moderne, visuali e facili da pubblicare per un salone.",
    hair_tiktok_hook:
      "Sei un TikTok strategist beauty. Genera hook brevi, virali e moderni per contenuti capelli, barber e trasformazioni.",
  };

  return [typeInstruction[type], ...shared].filter(Boolean).join("\n\n");
}

function getSportsPrompt(type: AIContentType, profile: BusinessProfile | null) {
  const paintballMode = profile?.sports_subcategory?.trim() === "paintball";
  const shared = [
    "Scrivi in italiano.",
    "Usa un tone of voice moderno, energico, orientato all'esperienza e social-first.",
    "Usa emoji intelligenti e non infantili: massimo 3 per variante, solo se aiutano ritmo e chiarezza.",
    "Le CTA devono puntare a prenotazione, richiesta preventivo, WhatsApp, DM o slot disponibili.",
    "Valorizza gruppi, eventi, compleanni, tornei, lezioni, prenotazioni campi o attivita outdoor in base alla sottocategoria.",
    paintballMode
      ? "Per paintball usa hook meno generici e piu specifici: compleanni bambini, addii al celibato, team building, gruppi di amici, tornei, FAQ prima volta, sicurezza e attrezzatura, promo weekend, eventi privati e gruppi numerosi."
      : null,
    paintballMode
      ? "Quando utile inserisci dettagli pratici che aumentano la conversione: prenotazione weekend, numero partecipanti, arrivo anticipato, briefing sicurezza, abbigliamento consigliato e caparra o saldo."
      : null,
    "Genera sempre tre versioni distinte: short, medium e long.",
    "Ogni versione deve avere hook forte, spacing leggibile, CTA chiara e tono credibile per Instagram, TikTok o WhatsApp.",
    "Non aggiungere testo fuori dal formato richiesto.",
    getSportsSubcategoryAngle(profile),
  ];

  const typeInstruction: Record<string, string> = {
    sports_caption:
      "Sei un copywriter senior per centri sportivi e attivita outdoor. Genera caption premium, locali e orientate a prenotazioni, gruppi ed eventi.",
    sports_reel_script:
      "Sei un content strategist senior per centri sportivi e outdoor. Genera Reel con hook forte, visual immediato, dinamica di gruppo e CTA prenotazione.",
    sports_promo:
      "Sei un marketing strategist per sport center e outdoor experiences. Genera promo chiare, desiderabili e facili da convertire in booking.",
    sports_client_message:
      "Sei un customer care copywriter per centri sportivi e outdoor. Genera messaggi WhatsApp chiari, caldi e orientati a prenotazioni, reminder o riattivazione clienti.",
  };

  const paintballAddons: Partial<Record<AIContentType, string>> = {
    sports_caption:
      "Se la sottocategoria e Paintball, genera contenuti ad alto impatto per compleanni bambini, addii al celibato, team building, gruppi di amici, promo weekend, tornei, esperienze outdoor e FAQ di prima volta.",
    sports_reel_script:
      "Se la sottocategoria e Paintball, crea Reel molto visuali con POV partita, attrezzatura, briefing sicurezza, modalita di gioco, backstage campo, recensioni di gruppo e CTA prenotazione immediata.",
    sports_promo:
      "Se la sottocategoria e Paintball, privilegia offerte per gruppi, compleanni, eventi privati, team building, tornei e weekend sold-out con forte senso di urgenza.",
    sports_client_message:
      "Se la sottocategoria e Paintball, scrivi messaggi WhatsApp pratici che includano quando utile data, orario, numero partecipanti, abbigliamento consigliato, arrivo anticipato, sicurezza, saldo o caparra e conferma disponibilita.",
  };

  return [typeInstruction[type], paintballMode ? paintballAddons[type] : null, ...shared]
    .filter(Boolean)
    .join("\n\n");
}

function getFormatInstructions(type: AIContentType) {
  const hairType =
    type === "sports_reel_script" ||
    type === "hair_reel_script" ||
    type === "hair_stories_idea" ||
    type === "hair_tiktok_hook";
  const whatsappLike = type === "sports_client_message" || type === "hair_client_message";

  return [
    "Restituisci ESATTAMENTE questo formato:",
    "[SHORT]",
    "contenuto short",
    "[/SHORT]",
    "[MEDIUM]",
    "contenuto medium",
    "[/MEDIUM]",
    "[LONG]",
    "contenuto long",
    "[/LONG]",
    hairType
      ? "Per Reel, Stories e TikTok usa struttura leggibile con Hook, sviluppo, idea visuale e CTA finale."
      : whatsappLike
        ? "Per i messaggi WhatsApp usa testo pratico, facilmente inoltrabile e con eventuali righe separate per data, orario, numero partecipanti, arrivo anticipato, sicurezza, abbigliamento e CTA."
        : "Usa testo pronto da pubblicare, con eventuali righe separate per CTA, hashtag o booking link quando utili.",
  ].join("\n");
}

export function buildGenerationSystemPrompt(type: AIContentType, profile: BusinessProfile | null) {
  const context = buildBusinessProfileContext(profile);
  const hairVertical = type.startsWith("hair_") || isHairBusinessType(profile?.business_type);
  const sportsVertical = type.startsWith("sports_") || isSportsBusinessType(profile?.business_type);
  const basePrompt = hairVertical
    ? getHairPrompt(type)
    : sportsVertical
      ? getSportsPrompt(type, profile)
      : getFitnessPrompt(type);

  return [basePrompt, getFormatInstructions(type), context]
    .filter((item) => item && item.trim())
    .join("\n\n");
}
