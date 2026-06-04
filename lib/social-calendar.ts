import { buildBusinessProfileContext, type BusinessProfile } from "@/lib/business-profile";
import {
  isHairBusinessType,
  isSportsBusinessType,
} from "@/lib/business-verticals";
import { getSportsKnowledgePack } from "@/lib/sportsKnowledgePacks";

export type SocialCalendarDays = 7 | 14 | 30;
export type SocialContentFormat =
  | "Post Instagram"
  | "Reel"
  | "Story"
  | "TikTok"
  | "WhatsApp follow-up";
export type SocialCalendarBusinessVertical = "fitness" | "hair" | "sports";

export type SocialCalendarEntry = {
  day: number;
  date: string;
  title: string;
  format: SocialContentFormat;
  pillar: string;
  caption: string;
  cta: string;
  hashtags: string;
};

export type SocialCalendarPayload = {
  title: string;
  objective: string;
  periodDays: SocialCalendarDays;
  businessType: string;
  entries: SocialCalendarEntry[];
};

export const SOCIAL_CALENDAR_COST = 5;

export const socialCalendarObjectives = [
  "Aumentare richieste e prenotazioni",
  "Riattivare clienti inattivi",
  "Promuovere una promo stagionale",
  "Costruire autorevolezza locale",
  "Riempire l'agenda della prossima settimana",
] as const;

export const socialCalendarDayOptions: SocialCalendarDays[] = [7, 14, 30];

function getCalendarPillars(vertical: SocialCalendarBusinessVertical, profile: BusinessProfile | null) {
  if (vertical === "sports") {
    return getSportsKnowledgePack(profile?.sports_subcategory?.trim()).socialCalendarIdeas;
  }

  if (vertical === "hair") {
    return [
      "prima/dopo",
      "balayage",
      "colore",
      "trattamenti",
      "promo",
      "trend",
      "recensioni",
      "backstage",
    ];
  }

  return [
    "trasformazioni",
    "motivazione",
    "promo",
    "testimonial",
    "consigli allenamento",
    "alimentazione",
    "open day",
    "prova gratuita",
  ];
}

export function inferCalendarVertical(profile: BusinessProfile | null): SocialCalendarBusinessVertical {
  if (isSportsBusinessType(profile?.business_type)) {
    return "sports";
  }

  return isHairBusinessType(profile?.business_type) ? "hair" : "fitness";
}

export function buildCalendarTitle(profile: BusinessProfile | null, days: SocialCalendarDays) {
  const businessName = profile?.business_name?.trim() || "Business";
  return `Calendario social ${days} giorni - ${businessName}`;
}

export function buildCalendarSystemPrompt(
  profile: BusinessProfile | null,
  days: SocialCalendarDays,
  objective: string,
) {
  const vertical = inferCalendarVertical(profile);
  const verticalLabel =
    vertical === "hair"
      ? "saloni parrucchieri e barber shop"
      : vertical === "sports"
        ? "centri sportivi e attivita outdoor"
        : "palestre e business fitness";
  const pillars = getCalendarPillars(vertical, profile).join(", ");
  const businessContext = buildBusinessProfileContext(profile);
  const sportsPack = vertical === "sports" ? getSportsKnowledgePack(profile?.sports_subcategory?.trim()) : null;
  const sportsFormats =
    sportsPack?.supportedCalendarFormats.join(" | ") ?? "Post Instagram | Reel | Story | TikTok";

  return [
    `Sei un senior social media strategist per ${verticalLabel}.`,
    "Scrivi in italiano.",
    "Crea un calendario editoriale premium, coerente con il business profile, concreto e pronto da usare.",
    "Usa automaticamente citta, servizi, target, CTA preferita, tone of voice e hashtag del profilo quando disponibili.",
    vertical === "sports"
      ? `Alterna i formati tra ${sportsFormats} in modo credibile e coerente con la sottocategoria attiva.`
      : "Alterna i formati tra Post Instagram, Reel, Story e TikTok in modo credibile.",
    `Il calendario deve coprire ${days} giorni e supportare questo obiettivo: ${objective}.`,
    `Per questo verticale usa soprattutto questi pillar: ${pillars}.`,
    vertical === "hair"
      ? "Per hair usa hook piu beauty/fashion, CTA piu orientate al booking, hashtag beauty/hair e tono moderno."
      : vertical === "sports"
        ? `Per sports/outdoor adatta tutto alla sottocategoria ${sportsPack?.label}. Usa questo posizionamento: ${sportsPack?.positioning} Inserisci soprattutto idee come ${sportsPack?.socialCalendarIdeas.join(", ")}. Se coerente, valorizza offerte come ${sportsPack?.offerTypes.join(", ")} e Reel/short-form come ${sportsPack?.reelIdeas.join(", ")}.`
        : "Per fitness usa tono energico ma professionale, CTA su prova gratuita/open day/DM e hashtag fitness locali.",
    "Restituisci solo JSON valido senza markdown o testo extra.",
    `Usa esattamente questo schema:
{
      "title": "string",
      "objective": "string",
      "periodDays": ${days},
      "entries": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "string",
      "format": "${sportsFormats}",
      "pillar": "string",
      "caption": "string breve, max 220 caratteri",
      "cta": "string",
      "hashtags": "#tag1 #tag2 #tag3"
    }
  ]
}`,
    businessContext,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function parseSocialCalendarResponse(raw: string): SocialCalendarPayload {
  const normalized = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "");
  const parsed = JSON.parse(normalized) as Partial<SocialCalendarPayload>;

  if (!parsed || !Array.isArray(parsed.entries) || parsed.entries.length === 0) {
    throw new Error("Calendario AI non valido.");
  }

  const entries = parsed.entries.map((entry, index) => ({
    day: Number(entry.day ?? index + 1),
    date: String(entry.date ?? ""),
    title: String(entry.title ?? ""),
    format: normalizeFormat(entry.format),
    pillar: String(entry.pillar ?? ""),
    caption: String(entry.caption ?? ""),
    cta: String(entry.cta ?? ""),
    hashtags: String(entry.hashtags ?? ""),
  }));

  return {
    title: String(parsed.title ?? "Calendario social"),
    objective: String(parsed.objective ?? ""),
    periodDays: Number(parsed.periodDays ?? entries.length) as SocialCalendarDays,
    businessType: String(parsed.businessType ?? ""),
    entries,
  };
}

function normalizeFormat(value: unknown): SocialContentFormat {
  const text = String(value ?? "").trim();

  if (
    text === "Post Instagram" ||
    text === "Reel" ||
    text === "Story" ||
    text === "TikTok" ||
    text === "WhatsApp follow-up"
  ) {
    return text;
  }

  if (/whatsapp|follow-up/i.test(text)) {
    return "WhatsApp follow-up";
  }

  if (/story/i.test(text)) {
    return "Story";
  }

  if (/tiktok/i.test(text)) {
    return "TikTok";
  }

  if (/reel/i.test(text)) {
    return "Reel";
  }

  return "Post Instagram";
}

export function buildFullContentPrompt(entry: SocialCalendarEntry, profile: BusinessProfile | null) {
  const profileName = profile?.business_name?.trim() || "attivita";
  const practicalNote =
    entry.format === "WhatsApp follow-up"
      ? "\nSe stai scrivendo un WhatsApp follow-up, rendilo pratico e includi quando utili data, orario, numero partecipanti, arrivo anticipato, abbigliamento consigliato, sicurezza, saldo o caparra e conferma disponibilita."
      : "";
  return `Sviluppa questo contenuto del calendario per ${profileName}.

Titolo: ${entry.title}
Formato: ${entry.format}
Pillar: ${entry.pillar}
Caption breve attuale: ${entry.caption}
CTA: ${entry.cta}
Hashtag: ${entry.hashtags}

Crea una versione completa pronta da pubblicare, mantenendo l'obiettivo e il tono del business profile.${practicalNote}`;
}

export function getGenerationTypeFromFormat(
  vertical: SocialCalendarBusinessVertical,
  format: SocialContentFormat,
) {
  if (vertical === "sports") {
    if (format === "WhatsApp follow-up") {
      return "sports_client_message" as const;
    }

    if (format === "Reel" || format === "TikTok") {
      return "sports_reel_script" as const;
    }

    if (format === "Story") {
      return "sports_caption" as const;
    }

    return "sports_caption" as const;
  }

  if (vertical === "hair") {
    if (format === "Reel" || format === "TikTok") {
      return "hair_reel_script" as const;
    }

    if (format === "Story") {
      return "hair_stories_idea" as const;
    }

    return "hair_caption" as const;
  }

  if (format === "Reel" || format === "TikTok") {
    return "reel" as const;
  }

  return "caption" as const;
}
