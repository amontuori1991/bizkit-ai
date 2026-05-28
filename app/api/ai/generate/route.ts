import { NextResponse } from "next/server";
import { buildGenerationSystemPrompt, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured, isSupabaseConfigured } from "@/lib/env";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type GenerateType = "caption" | "reel" | "promo";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase non configurato. Configura autenticazione e database per usare la dashboard." },
        { status: 503 },
      );
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: "OpenAI non configurato. I generatori AI sono temporaneamente disattivati." },
        { status: 503 },
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase non disponibile." }, { status: 503 });
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Utente non autenticato." }, { status: 401 });
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

    const { data: profile } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const systemPrompt = buildGenerationSystemPrompt(
      body.type,
      (profile as BusinessProfile | null) ?? null,
    );

    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        { error: "OpenAI non configurato. I generatori AI sono temporaneamente disattivati." },
        { status: 503 },
      );
    }
    const response = await client.responses.create({
      model: getOpenAIModel(),
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
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

    const { data, error } = await supabase
      .from("generated_contents")
      .insert({
        user_id: user.id,
        type: body.type,
        title: `${body.type} generation`,
        input_prompt: body.prompt.trim(),
        output_text: result,
        is_saved: false,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      result,
      generationId: data.id,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Errore durante la generazione AI." },
      { status: 500 },
    );
  }
}
