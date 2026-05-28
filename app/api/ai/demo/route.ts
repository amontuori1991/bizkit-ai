import { NextRequest, NextResponse } from "next/server";
import { parseOutputVariants } from "@/lib/ai-output";
import { isOpenAIConfigured } from "@/lib/env";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";

type GenerateType = "caption" | "reel" | "promo";

const DEMO_COOKIE = "bizkit_ai_demo_used";

function buildDemoPrompt(type: GenerateType) {
  const typeInstructions: Record<GenerateType, string> = {
    caption:
      "Sei un copywriter senior per palestre. Genera caption premium per una palestra locale italiana.",
    reel:
      "Sei un content strategist senior per palestre. Genera un concept Reel premium per una palestra locale italiana.",
    promo:
      "Sei un consulente marketing senior per palestre. Genera una promo premium per una palestra locale italiana.",
  };

  return [
    typeInstructions[type],
    "Scrivi in italiano.",
    "Usa un tone of voice professionale, energico e credibile.",
    "Usa da 0 a 3 emoji intelligenti solo se davvero utili.",
    "Genera esattamente tre versioni distinte: short, medium e long.",
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
    "Il contesto di riferimento e una palestra moderna in Italia che vuole attirare lead locali e richieste prova gratuita.",
  ].join("\n\n");
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
      type?: GenerateType;
      prompt?: string;
    };

    if (!body.type || !["caption", "reel", "promo"].includes(body.type)) {
      return NextResponse.json({ error: "Tipo di generazione non valido." }, { status: 400 });
    }

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "Prompt obbligatorio." }, { status: 400 });
    }

    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        { error: "OpenAI non configurato. La demo AI e temporaneamente disattivata." },
        { status: 503 },
      );
    }

    const response = await client.responses.create({
      model: getOpenAIModel(),
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: buildDemoPrompt(body.type) }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: body.prompt.trim() }],
        },
      ],
    });

    const result = response.output_text?.trim();
    if (!result) {
      return NextResponse.json({ error: "Nessun contenuto generato." }, { status: 500 });
    }

    const payload = NextResponse.json({
      result,
      variants: parseOutputVariants(result),
      demo: true,
    });

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

