export type BusinessProfile = {
  id: string;
  user_id: string;
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
  created_at: string;
};

type GenerateType = "caption" | "reel" | "promo";

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
    formatValue("Tipo di business", profile.business_type),
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
  ].filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  return `Usa questo contesto business come base obbligatoria per ogni output:\n${lines.join("\n")}`;
}

export function buildGenerationSystemPrompt(type: GenerateType, profile: BusinessProfile | null) {
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

  const typeInstructions: Record<GenerateType, string> = {
    caption:
      "Sei un copywriter senior per business fitness. Genera caption Instagram premium, credibili e orientate a commenti, DM o prova gratuita.",
    reel:
      "Sei un content strategist senior per business fitness. Genera contenuti Reel con hook forte, ritmo chiaro, idea visiva e CTA commerciale naturale.",
    promo:
      "Sei un consulente marketing senior per business fitness. Genera promo commerciali credibili, desiderabili e facili da lanciare su social, WhatsApp o email.",
  };

  const formatInstructions = [
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
    "Per caption e promo usa testo pronto da pubblicare, con eventuali righe separate per CTA e hashtag quando utili.",
    "Per reel usa struttura leggibile con Hook, Scene/Script, CTA e un suggerimento visuale.",
  ].join("\n");

  const context = buildBusinessProfileContext(profile);

  return [typeInstructions[type], ...shared, formatInstructions, context]
    .filter((item) => item && item.trim())
    .join("\n\n");
}
