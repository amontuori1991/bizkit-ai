import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AIPlanId = "free" | "pro" | "agency";

export type AILimitConfig = {
  dailyGenerations: number;
  cooldownSeconds: number;
  ipWindowMinutes: number;
  ipMaxRequests: number;
};

export const AI_LIMITS: Record<AIPlanId, AILimitConfig> = {
  free: {
    dailyGenerations: 10,
    cooldownSeconds: 45,
    ipWindowMinutes: 10,
    ipMaxRequests: 15,
  },
  pro: {
    dailyGenerations: 100,
    cooldownSeconds: 12,
    ipWindowMinutes: 10,
    ipMaxRequests: 40,
  },
  agency: {
    dailyGenerations: 500,
    cooldownSeconds: 3,
    ipWindowMinutes: 10,
    ipMaxRequests: 120,
  },
};

export type UsageStatus =
  | { allowed: true; planId: AIPlanId; limit: AILimitConfig; usageToday: number; remainingToday: number }
  | {
      allowed: false;
      reason: "daily_limit" | "cooldown" | "ip_rate_limit";
      message: string;
      planId: AIPlanId;
      limit: AILimitConfig;
      usageToday: number;
      remainingToday: number;
      retryAfterSeconds?: number;
    };

export function normalizeAIPlanId(subscriptionTier?: string | null): AIPlanId {
  if (subscriptionTier === "agency") {
    return "agency";
  }

  if (subscriptionTier === "pro" || subscriptionTier === "starter") {
    return "pro";
  }

  return "free";
}

export function getCurrentUsageDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getIpHash(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const rawIp = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
  return createHash("sha256").update(rawIp).digest("hex");
}

export function getPromptPreview(prompt: string) {
  return prompt.trim().replace(/\s+/g, " ").slice(0, 240);
}

export function getTokenUsage(response: {
  usage?: {
    input_tokens?: number | null;
    output_tokens?: number | null;
    total_tokens?: number | null;
  } | null;
}) {
  const inputTokens = Math.max(0, response.usage?.input_tokens ?? 0);
  const outputTokens = Math.max(0, response.usage?.output_tokens ?? 0);
  const totalTokens =
    Math.max(0, response.usage?.total_tokens ?? 0) || inputTokens + outputTokens;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
  };
}

export async function checkAIUsageAccess(
  supabase: SupabaseClient,
  userId: string,
  planId: AIPlanId,
  ipHash: string,
) {
  const limit = AI_LIMITS[planId];
  const usageDate = getCurrentUsageDate();

  const [{ data: usageRow }, { data: recentUserLog }, { count: ipCount }] = await Promise.all([
    supabase
      .from("ai_usage_daily")
      .select("generation_count")
      .eq("user_id", userId)
      .eq("usage_date", usageDate)
      .maybeSingle(),
    supabase
      .from("ai_request_logs")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("ai_request_logs")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", new Date(Date.now() - limit.ipWindowMinutes * 60 * 1000).toISOString()),
  ]);

  const usageToday = usageRow?.generation_count ?? 0;
  const remainingToday = Math.max(0, limit.dailyGenerations - usageToday);

  if (usageToday >= limit.dailyGenerations) {
    return {
      allowed: false,
      reason: "daily_limit",
      message: `Hai raggiunto il limite giornaliero del piano ${planId}: ${limit.dailyGenerations} generazioni oggi.`,
      planId,
      limit,
      usageToday,
      remainingToday,
    } satisfies UsageStatus;
  }

  if ((ipCount ?? 0) >= limit.ipMaxRequests) {
    return {
      allowed: false,
      reason: "ip_rate_limit",
      message: `Troppe richieste dallo stesso IP. Attendi qualche minuto prima di riprovare.`,
      planId,
      limit,
      usageToday,
      remainingToday,
      retryAfterSeconds: limit.cooldownSeconds,
    } satisfies UsageStatus;
  }

  if (recentUserLog?.created_at) {
    const diffSeconds = Math.floor(
      (Date.now() - new Date(recentUserLog.created_at).getTime()) / 1000,
    );

    if (diffSeconds < limit.cooldownSeconds) {
      const retryAfterSeconds = limit.cooldownSeconds - diffSeconds;
      return {
        allowed: false,
        reason: "cooldown",
        message: `Stai generando troppo velocemente. Riprova tra ${retryAfterSeconds} secondi.`,
        planId,
        limit,
        usageToday,
        remainingToday,
        retryAfterSeconds,
      } satisfies UsageStatus;
    }
  }

  return {
    allowed: true,
    planId,
    limit,
    usageToday,
    remainingToday,
  } satisfies UsageStatus;
}

export async function logAIRequest(
  supabase: SupabaseClient,
  input: {
    userId: string;
    ipHash: string;
    generationType: string;
    promptPreview: string;
    planId: AIPlanId;
    status: "success" | "blocked" | "error";
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    errorMessage?: string | null;
  },
) {
  const { error } = await supabase.from("ai_request_logs").insert({
    user_id: input.userId,
    ip_hash: input.ipHash,
    generation_type: input.generationType,
    prompt_preview: input.promptPreview,
    plan_id: input.planId,
    status: input.status,
    input_tokens: input.inputTokens ?? 0,
    output_tokens: input.outputTokens ?? 0,
    total_tokens: input.totalTokens ?? 0,
    error_message: input.errorMessage ?? null,
  });

  if (error) {
    throw error;
  }
}

export async function incrementAIUsageDaily(
  supabase: SupabaseClient,
  input: {
    userId: string;
    planId: AIPlanId;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  },
) {
  const usageDate = getCurrentUsageDate();
  const { data: existingRow, error: selectError } = await supabase
    .from("ai_usage_daily")
    .select("*")
    .eq("user_id", input.userId)
    .eq("usage_date", usageDate)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (!existingRow) {
    const { error: insertError } = await supabase.from("ai_usage_daily").insert({
      user_id: input.userId,
      usage_date: usageDate,
      plan_id: input.planId,
      generation_count: 1,
      input_tokens: input.inputTokens,
      output_tokens: input.outputTokens,
      total_tokens: input.totalTokens,
      last_generation_at: new Date().toISOString(),
    });

    if (insertError) {
      throw insertError;
    }

    return {
      usageDate,
      generationCount: 1,
      dailyLimit: AI_LIMITS[input.planId].dailyGenerations,
    };
  }

  const nextGenerationCount = (existingRow.generation_count ?? 0) + 1;
  const { error: updateError } = await supabase
    .from("ai_usage_daily")
    .update({
      plan_id: input.planId,
      generation_count: nextGenerationCount,
      input_tokens: (existingRow.input_tokens ?? 0) + input.inputTokens,
      output_tokens: (existingRow.output_tokens ?? 0) + input.outputTokens,
      total_tokens: (existingRow.total_tokens ?? 0) + input.totalTokens,
      last_generation_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", existingRow.id)
    .eq("user_id", input.userId);

  if (updateError) {
    throw updateError;
  }

  return {
    usageDate,
    generationCount: nextGenerationCount,
    dailyLimit: AI_LIMITS[input.planId].dailyGenerations,
  };
}
