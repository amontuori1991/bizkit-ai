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
import { type BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured, isSupabaseConfigured } from "@/lib/env";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import {
  buildCalendarSystemPrompt,
  buildCalendarTitle,
  parseSocialCalendarResponse,
  SOCIAL_CALENDAR_COST,
  type SocialCalendarDays,
} from "@/lib/social-calendar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const supportedDays = new Set<SocialCalendarDays>([7, 14, 30]);

export async function POST(request: Request) {
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | null = null;
  let userId: string | null = null;
  let planId: "free" | "pro" | "agency" = "free";
  let ipHash = "unknown";
  let promptPreview = "";

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase non configurato. Configura autenticazione e database per usare il calendario." },
        { status: 503 },
      );
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: "OpenAI non configurato. Il generatore calendario e temporaneamente disattivato." },
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
      days?: number;
      objective?: string;
    };

    const days = body.days as SocialCalendarDays;
    const objective = body.objective?.trim();

    if (!supportedDays.has(days)) {
      return NextResponse.json({ error: "Numero giorni non valido." }, { status: 400 });
    }

    if (!objective) {
      return NextResponse.json({ error: "Obiettivo obbligatorio." }, { status: 400 });
    }

    ipHash = getIpHash(request);
    promptPreview = getPromptPreview(`social-calendar ${days} giorni: ${objective}`);

    const [{ data: profile }, { data: accountProfile }] = await Promise.all([
      supabase.from("business_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle(),
    ]);

    planId = normalizeAIPlanId(accountProfile?.subscription_tier);
    const usageStatus = await checkAIUsageAccess(
      supabase,
      user.id,
      planId,
      ipHash,
      SOCIAL_CALENDAR_COST,
    );

    if (!usageStatus.allowed) {
      await logAIRequest(supabase, {
        userId: user.id,
        ipHash,
        generationType: "social_calendar",
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
        { status: 429 },
      );
    }

    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        { error: "OpenAI non configurato. Il generatore calendario e temporaneamente disattivato." },
        { status: 503 },
      );
    }

    const response = await client.responses.create({
      model: getOpenAIModel(),
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: buildCalendarSystemPrompt((profile as BusinessProfile | null) ?? null, days, objective),
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Genera un calendario editoriale di ${days} giorni con focus su: ${objective}.`,
            },
          ],
        },
      ],
    });

    const result = response.output_text?.trim();
    if (!result) {
      await logAIRequest(supabase, {
        userId: user.id,
        ipHash,
        generationType: "social_calendar",
        promptPreview,
        planId,
        status: "error",
        errorMessage: "Nessun calendario generato.",
      });
      return NextResponse.json({ error: "Nessun calendario generato." }, { status: 500 });
    }

    const calendar = parseSocialCalendarResponse(result);
    const title = buildCalendarTitle((profile as BusinessProfile | null) ?? null, days);
    const tokenUsage = getTokenUsage(response);

    const { data, error } = await supabase
      .from("content_calendars")
      .insert({
        user_id: user.id,
        business_type: (profile as BusinessProfile | null)?.business_type ?? "gym",
        title,
        period_days: days,
        calendar_json: {
          ...calendar,
          title,
          objective,
          businessType: (profile as BusinessProfile | null)?.business_type ?? "gym",
        },
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    const usageSummary = await incrementAIUsageDaily(supabase, {
      userId: user.id,
      planId,
      costUnits: SOCIAL_CALENDAR_COST,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      totalTokens: tokenUsage.totalTokens,
    });

    await logAIRequest(supabase, {
      userId: user.id,
      ipHash,
      generationType: "social_calendar",
      promptPreview,
      planId,
      status: "success",
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      totalTokens: tokenUsage.totalTokens,
    });

    return NextResponse.json({
      calendar: {
        ...calendar,
        title,
        objective,
        businessType: (profile as BusinessProfile | null)?.business_type ?? "gym",
      },
      calendarId: data.id,
      usage: {
        planId,
        usedToday: usageSummary.generationCount,
        dailyLimit: usageSummary.dailyLimit,
        remainingToday: Math.max(0, usageSummary.dailyLimit - usageSummary.generationCount),
        totalTokens: tokenUsage.totalTokens,
        costUnits: SOCIAL_CALENDAR_COST,
      },
    });
  } catch (error) {
    console.error("AI calendar generation error:", error);

    if (supabase && userId) {
      try {
        await logAIRequest(supabase, {
          userId,
          ipHash,
          generationType: "social_calendar",
          promptPreview,
          planId,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Errore durante la generazione del calendario.",
        });
      } catch (loggingError) {
        console.error("AI calendar logging error:", loggingError);
      }
    }

    return NextResponse.json(
      { error: "Errore durante la generazione del calendario." },
      { status: 500 },
    );
  }
}
