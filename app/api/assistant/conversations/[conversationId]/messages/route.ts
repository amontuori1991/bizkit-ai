import { NextResponse } from "next/server";
import {
  buildAssistantSystemPrompt,
  checkAssistantUsageAccess,
  createConversationTitleFromPrompt,
  getAssistantBusinessSnapshot,
} from "@/lib/assistant-coach";
import { getIpHash, getPromptPreview, getTokenUsage, logAIRequest, normalizeAIPlanId } from "@/lib/ai-usage";
import { isOpenAIConfigured, isSupabaseConfigured } from "@/lib/env";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  let userId: string | null = null;
  let ipHash = "unknown";
  let promptPreview = "";
  let planId: "free" | "starter" | "pro" | "agency" = "free";
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | null = null;

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase non configurato." }, { status: 503 });
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json({ error: "OpenAI non configurato." }, { status: 503 });
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
    const { conversationId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { content?: string };
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json({ error: "Messaggio obbligatorio." }, { status: 400 });
    }

    ipHash = getIpHash(request);
    promptPreview = getPromptPreview(content);

    const [{ data: profileRow }, { data: conversation }] = await Promise.all([
      supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle(),
      supabase
        .from("assistant_conversations")
        .select("id,title")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (!conversation) {
      return NextResponse.json({ error: "Conversazione non trovata." }, { status: 404 });
    }

    planId = normalizeAIPlanId(profileRow?.subscription_tier);
    const usageStatus = await checkAssistantUsageAccess(supabase, user.id, profileRow?.subscription_tier);

    if (!usageStatus.allowed) {
      await logAIRequest(supabase, {
        userId: user.id,
        ipHash,
        generationType: "assistant_coach",
        promptPreview,
        planId,
        status: "blocked",
        errorMessage: usageStatus.message,
      });

      return NextResponse.json(
        {
          error: usageStatus.message,
          usage: {
            planId: usageStatus.planId,
            usedThisMonth: usageStatus.usedThisMonth,
            monthlyLimit: usageStatus.monthlyLimit,
            remainingThisMonth: usageStatus.remainingThisMonth,
          },
          upgradePlan: usageStatus.upgradePlan,
          upgradeUrl: usageStatus.upgradeUrl,
        },
        { status: 429 },
      );
    }

    const snapshot = await getAssistantBusinessSnapshot(supabase, user.id, profileRow?.subscription_tier);
    const { data: recentMessages } = await supabase
      .from("assistant_messages")
      .select("role,content")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(10);

    const { error: userInsertError } = await supabase.from("assistant_messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      content,
    });

    if (userInsertError) {
      throw userInsertError;
    }

    if (conversation.title === "Nuova conversazione") {
      await supabase
        .from("assistant_conversations")
        .update({
          title: createConversationTitleFromPrompt(content),
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("assistant_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)
        .eq("user_id", user.id);
    }

    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json({ error: "OpenAI non configurato." }, { status: 503 });
    }

    const response = await client.responses.create({
      model: getOpenAIModel(),
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: buildAssistantSystemPrompt(snapshot) }],
        },
        ...((recentMessages ?? []).map((message) => ({
          role: message.role,
          content: [{ type: "input_text", text: message.content }],
        })) as Array<{
          role: "user" | "assistant";
          content: Array<{ type: "input_text"; text: string }>;
        }>),
        {
          role: "user",
          content: [{ type: "input_text", text: content }],
        },
      ],
    });

    const result = response.output_text?.trim();
    if (!result) {
      throw new Error("Nessuna risposta generata dal Coach.");
    }

    const tokenUsage = getTokenUsage(response);
    const { data: assistantMessage, error: assistantInsertError } = await supabase
      .from("assistant_messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "assistant",
        content: result,
        input_tokens: tokenUsage.inputTokens,
        output_tokens: tokenUsage.outputTokens,
        total_tokens: tokenUsage.totalTokens,
      })
      .select("id,conversation_id,user_id,role,content,input_tokens,output_tokens,total_tokens,created_at")
      .single();

    if (assistantInsertError) {
      throw assistantInsertError;
    }

    await supabase
      .from("assistant_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("user_id", user.id);

    await logAIRequest(supabase, {
      userId: user.id,
      ipHash,
      generationType: "assistant_coach",
      promptPreview,
      planId,
      status: "success",
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      totalTokens: tokenUsage.totalTokens,
    });

    return NextResponse.json({
      message: assistantMessage,
      usage: {
        planId: usageStatus.planId,
        usedThisMonth: usageStatus.usedThisMonth + 1,
        monthlyLimit: usageStatus.monthlyLimit,
        remainingThisMonth: Math.max(0, usageStatus.monthlyLimit - (usageStatus.usedThisMonth + 1)),
      },
    });
  } catch (error) {
    console.error("Assistant message error:", error);

    if (supabase && userId) {
      try {
        await logAIRequest(supabase, {
          userId,
          ipHash,
          generationType: "assistant_coach",
          promptPreview,
          planId,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Errore durante il Coach AI.",
        });
      } catch (loggingError) {
        console.error("Assistant logging error:", loggingError);
      }
    }

    return NextResponse.json({ error: "Errore durante la risposta del Coach." }, { status: 500 });
  }
}
