import { NextResponse } from "next/server";
import {
  checkAIUsageAccess,
  getIpHash,
  getPromptPreview,
  getTokenUsage,
  incrementAIUsageDaily,
  logAIRequest,
  normalizeAIPlanId,
} from "@/lib/ai-usage";
import { buildGenerationSystemPrompt, type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured, isSupabaseConfigured } from "@/lib/env";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type GenerateType = "caption" | "reel" | "promo";

export async function POST(request: Request) {
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | null = null;
  let userId: string | null = null;
  let planId: "free" | "pro" | "agency" = "free";
  let ipHash = "unknown";
  let promptPreview = "";
  let generationType = "unknown";

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

    supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase non disponibile." }, { status: 503 });
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Utente non autenticato." }, { status: 401 });
    }
    userId = user.id;

    const body = (await request.json().catch(() => ({}))) as {
      type?: GenerateType;
      prompt?: string;
    };
    generationType = body.type ?? "unknown";

    if (!body.type || !["caption", "reel", "promo"].includes(body.type)) {
      return NextResponse.json({ error: "Tipo di generazione non valido." }, { status: 400 });
    }

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "Prompt obbligatorio." }, { status: 400 });
    }

    ipHash = getIpHash(request);
    promptPreview = getPromptPreview(body.prompt);
    const [{ data: profile }, { data: accountProfile }] = await Promise.all([
      supabase.from("business_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle(),
    ]);

    planId = normalizeAIPlanId(accountProfile?.subscription_tier);
    const usageStatus = await checkAIUsageAccess(supabase, user.id, planId, ipHash);

    if (!usageStatus.allowed) {
      await logAIRequest(supabase, {
        userId: user.id,
        ipHash,
        generationType: body.type,
        promptPreview,
        planId,
        status: "blocked",
        errorMessage: usageStatus.message,
      });

      return NextResponse.json(
        {
          error: usageStatus.message,
          code: usageStatus.reason,
          usage: {
            planId,
            usedToday: usageStatus.usageToday,
            dailyLimit: usageStatus.limit.dailyGenerations,
            remainingToday: usageStatus.remainingToday,
          },
          retryAfterSeconds: usageStatus.retryAfterSeconds ?? null,
        },
        { status: usageStatus.reason === "daily_limit" ? 429 : 429 },
      );
    }

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
      await logAIRequest(supabase, {
        userId: user.id,
        ipHash,
        generationType: body.type,
        promptPreview,
        planId,
        status: "error",
        errorMessage: "Nessun contenuto generato.",
      });
      return NextResponse.json({ error: "Nessun contenuto generato." }, { status: 500 });
    }

    const tokenUsage = getTokenUsage(response);

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

    const usageSummary = await incrementAIUsageDaily(supabase, {
      userId: user.id,
      planId,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      totalTokens: tokenUsage.totalTokens,
    });

    await logAIRequest(supabase, {
      userId: user.id,
      ipHash,
      generationType: body.type,
      promptPreview,
      planId,
      status: "success",
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      totalTokens: tokenUsage.totalTokens,
    });

    return NextResponse.json({
      result,
      generationId: data.id,
      usage: {
        planId,
        usedToday: usageSummary.generationCount,
        dailyLimit: usageSummary.dailyLimit,
        remainingToday: Math.max(0, usageSummary.dailyLimit - usageSummary.generationCount),
        inputTokens: tokenUsage.inputTokens,
        outputTokens: tokenUsage.outputTokens,
        totalTokens: tokenUsage.totalTokens,
      },
    });
  } catch (error) {
    console.error("AI generation error:", error);

    if (supabase && userId) {
      try {
        await logAIRequest(supabase, {
          userId,
          ipHash,
          generationType,
          promptPreview,
          planId,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Errore durante la generazione AI.",
        });
      } catch (loggingError) {
        console.error("AI logging error:", loggingError);
      }
    }

    return NextResponse.json(
      { error: "Errore durante la generazione AI." },
      { status: 500 },
    );
  }
}
