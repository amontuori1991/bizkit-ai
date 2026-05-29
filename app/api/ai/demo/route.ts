import { NextRequest, NextResponse } from "next/server";
import { parseOutputVariants } from "@/lib/ai-output";
import { buildGenerationSystemPrompt, type BusinessProfile } from "@/lib/business-profile";
import { type AIContentType } from "@/lib/business-verticals";
import { isOpenAIConfigured } from "@/lib/env";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import {
  buildCalendarSystemPrompt,
  parseSocialCalendarResponse,
  type SocialCalendarDays,
} from "@/lib/social-calendar";

const DEMO_COOKIE = "bizkit_ai_demo_used";

type DemoVertical = "gym" | "hair";

function buildDemoProfile(vertical: DemoVertical): BusinessProfile {
  if (vertical === "hair") {
    return {
      id: "demo",
      user_id: "demo",
      is_primary: true,
      business_name: "Atelier Glow Hair",
      business_type: "hair_salon",
      city: "Milano",
      address: null,
      website: null,
      instagram: "@atelierglowhair",
      tone_of_voice: "Moderno, fashion, emozionale",
      target_audience: "Donne 24-45 che cercano colore, styling e trasformazioni premium",
      services: "Balayage, colore, piega, trattamento, extension",
      unique_selling_points: "Consulenza look personalizzata, premium experience, risultato fotografabile",
      preferred_cta: "Prenota il tuo appuntamento",
      preferred_hashtags: "#hairstylemilano #balayage #hairtransformation",
      salon_specialties: "Balayage, colore, trasformazioni capelli",
      booking_link: "https://booking.example.com",
      opening_hours: "Mar-Sab 9:00-19:00",
      stylist_names: "Giulia, Marco",
      products_used: "Kerastase, Olaplex",
      salon_style: "Luxury salon",
      created_at: new Date().toISOString(),
    };
  }

  return {
    id: "demo",
    user_id: "demo",
    is_primary: true,
    business_name: "Palestra Energia",
    business_type: "gym",
    city: "Milano",
    address: null,
    website: null,
    instagram: "@palestraenergia",
    tone_of_voice: "Professionale, energico, accogliente",
    target_audience: "Uomini e donne 28-45 che vogliono tornare in forma",
    services: "Sala pesi, coaching, small group",
    unique_selling_points: "Coach dedicati, ambiente motivante, percorsi su misura",
    preferred_cta: "Prenota la prova gratuita",
    preferred_hashtags: "#palestramilano #fitnessmilano",
    salon_specialties: null,
    booking_link: null,
    opening_hours: null,
    stylist_names: null,
    products_used: null,
    salon_style: null,
    created_at: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: "OpenAI non configurato. La demo AI e temporaneamente disattivata." },
        { status: 503 },
      );
    }

    if (request.cookies.get(DEMO_COOKIE)?.value === "1") {
      return NextResponse.json(
        { error: "Hai gia usato la demo gratuita. Crea un account per continuare a generare." },
        { status: 429 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      type?: AIContentType;
      prompt?: string;
      vertical?: DemoVertical;
      businessType?: string;
      mode?: "content" | "calendar";
      days?: SocialCalendarDays;
      objective?: string;
    };

    const vertical =
      body.vertical === "hair" ||
      body.businessType?.startsWith("hair") ||
      body.type?.startsWith("hair_")
        ? "hair"
        : "gym";
    const profile = buildDemoProfile(vertical);
    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        { error: "OpenAI non configurato. La demo AI e temporaneamente disattivata." },
        { status: 503 },
      );
    }

    const payload =
      body.mode === "calendar"
        ? await handleDemoCalendar(client, profile, body.objective, body.days ?? 7)
        : await handleDemoContent(client, body.type, body.prompt, profile);

    payload.cookies.set({
      name: DEMO_COOKIE,
      value: "1",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });

    return payload;
  } catch (error) {
    console.error("AI demo generation error:", error);
    return NextResponse.json({ error: "Errore durante la demo AI." }, { status: 500 });
  }
}

async function handleDemoContent(
  client: NonNullable<ReturnType<typeof getOpenAIClient>>,
  type: AIContentType | undefined,
  prompt: string | undefined,
  profile: BusinessProfile,
) {
  if (!type) {
    return NextResponse.json({ error: "Tipo di generazione non valido." }, { status: 400 });
  }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt obbligatorio." }, { status: 400 });
  }

  const response = await client.responses.create({
    model: getOpenAIModel(),
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: buildGenerationSystemPrompt(type, profile) }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: prompt.trim() }],
      },
    ],
  });

  const result = response.output_text?.trim();
  if (!result) {
    return NextResponse.json({ error: "Nessun contenuto generato." }, { status: 500 });
  }

  return NextResponse.json({
    result,
    variants: parseOutputVariants(result),
    demo: true,
  });
}

async function handleDemoCalendar(
  client: NonNullable<ReturnType<typeof getOpenAIClient>>,
  profile: BusinessProfile,
  objective: string | undefined,
  days: SocialCalendarDays,
) {
  if (!objective?.trim()) {
    return NextResponse.json({ error: "Obiettivo obbligatorio." }, { status: 400 });
  }

  const response = await client.responses.create({
    model: getOpenAIModel(),
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: buildCalendarSystemPrompt(profile, days, objective.trim()) }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: `Genera un mini calendario di ${days} giorni con focus su: ${objective.trim()}.` }],
      },
    ],
  });

  const result = response.output_text?.trim();
  if (!result) {
    return NextResponse.json({ error: "Nessun calendario generato." }, { status: 500 });
  }

  return NextResponse.json({
    calendar: parseSocialCalendarResponse(result),
    demo: true,
  });
}
