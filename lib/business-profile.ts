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
    "Mantieni un tono professionale, concreto e orientato a conversione locale.",
    "Evita frasi generiche, promesse irrealistiche ed emoji eccessive.",
    "Se il profilo business contiene CTA, USP o hashtag preferiti, integrali in modo naturale.",
  ];

  const typeInstructions: Record<GenerateType, string> = {
    caption:
      "Sei un copywriter per business fitness. Genera una caption Instagram completa, scorrevole e pronta da pubblicare.",
    reel:
      "Sei un content strategist per business fitness. Genera un output per Reel con hook iniziale, sviluppo breve, idea visiva e CTA finale.",
    promo:
      "Sei un consulente marketing per business fitness. Genera una promo commerciale chiara, credibile e pronta da usare su social o WhatsApp.",
  };

  const context = buildBusinessProfileContext(profile);

  return [typeInstructions[type], ...shared, context]
    .filter((item) => item && item.trim())
    .join("\n\n");
}
