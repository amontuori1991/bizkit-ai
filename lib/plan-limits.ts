import type { SupabaseClient } from "@supabase/supabase-js";

export type RuntimePlanId = "free" | "starter" | "pro" | "agency";
export type PaidPlanId = "starter" | "pro" | "agency";
export type LimitValue = number | null;
export type PlanResourceKey =
  | "aiDailyCredits"
  | "businessProfiles"
  | "savedContents"
  | "calendars"
  | "crmClients"
  | "generatedContents";

export type PlanLimitConfig = {
  label: string;
  aiDailyCredits: number;
  businessProfiles: LimitValue;
  savedContents: LimitValue;
  calendars: LimitValue;
  crmClients: LimitValue;
  generatedContents: LimitValue;
  seats: number;
  cooldownSeconds: number;
  ipWindowMinutes: number;
  ipMaxRequests: number;
  nextUpgrade: PaidPlanId | null;
};

export type UsageProgress = {
  used: number;
  limit: LimitValue;
  remaining: number | null;
  percent: number;
  reached: boolean;
  label: string;
};

export type PlanUsageSummary = {
  planId: RuntimePlanId;
  limits: PlanLimitConfig;
  counts: {
    aiCreditsToday: number;
    aiTokensToday: number;
    businessProfiles: number;
    savedContents: number;
    calendars: number;
    crmClients: number;
    generatedContents: number;
  };
  progress: {
    aiCreditsToday: UsageProgress;
    businessProfiles: UsageProgress;
    savedContents: UsageProgress;
    calendars: UsageProgress;
    crmClients: UsageProgress;
    generatedContents: UsageProgress;
  };
};

export type PlanLimitStatus =
  | {
      allowed: true;
      planId: RuntimePlanId;
      resource: PlanResourceKey;
      used: number;
      limit: LimitValue;
      remaining: number | null;
    }
  | {
      allowed: false;
      planId: RuntimePlanId;
      resource: PlanResourceKey;
      used: number;
      limit: LimitValue;
      remaining: number | null;
      message: string;
      upgradePlan: PaidPlanId | null;
      upgradeUrl: string;
    };

export const PLAN_LIMITS: Record<RuntimePlanId, PlanLimitConfig> = {
  free: {
    label: "Free",
    aiDailyCredits: 10,
    businessProfiles: 1,
    savedContents: 15,
    calendars: 3,
    crmClients: 25,
    generatedContents: null,
    seats: 1,
    cooldownSeconds: 45,
    ipWindowMinutes: 10,
    ipMaxRequests: 15,
    nextUpgrade: "starter",
  },
  starter: {
    label: "Starter",
    aiDailyCredits: 100,
    businessProfiles: 1,
    savedContents: 100,
    calendars: 20,
    crmClients: 100,
    generatedContents: null,
    seats: 1,
    cooldownSeconds: 20,
    ipWindowMinutes: 10,
    ipMaxRequests: 30,
    nextUpgrade: "pro",
  },
  pro: {
    label: "Pro",
    aiDailyCredits: 300,
    businessProfiles: 3,
    savedContents: 1000,
    calendars: 200,
    crmClients: 1000,
    generatedContents: null,
    seats: 3,
    cooldownSeconds: 8,
    ipWindowMinutes: 10,
    ipMaxRequests: 60,
    nextUpgrade: "agency",
  },
  agency: {
    label: "Agency",
    aiDailyCredits: 1000,
    businessProfiles: null,
    savedContents: null,
    calendars: null,
    crmClients: null,
    generatedContents: null,
    seats: 10,
    cooldownSeconds: 3,
    ipWindowMinutes: 10,
    ipMaxRequests: 150,
    nextUpgrade: null,
  },
};

const RESOURCE_LABELS: Record<PlanResourceKey, string> = {
  aiDailyCredits: "crediti AI giornalieri",
  businessProfiles: "business profile",
  savedContents: "contenuti salvati",
  calendars: "calendari salvati",
  crmClients: "clienti CRM",
  generatedContents: "generazioni AI",
};

const RESOURCE_TABLES: Partial<Record<PlanResourceKey, string>> = {
  businessProfiles: "business_profiles",
  savedContents: "saved_contents",
  calendars: "content_calendars",
  crmClients: "clients",
  generatedContents: "generated_contents",
};

export function getCurrentUsageDate() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizePlanId(subscriptionTier?: string | null): RuntimePlanId {
  if (subscriptionTier === "starter" || subscriptionTier === "pro" || subscriptionTier === "agency") {
    return subscriptionTier;
  }

  return "free";
}

export function getPlanLimits(planId: RuntimePlanId) {
  return PLAN_LIMITS[planId];
}

export function formatPlanLabel(planId: RuntimePlanId) {
  return PLAN_LIMITS[planId].label;
}

export function buildUsageProgress(used: number, limit: LimitValue, label: string): UsageProgress {
  if (limit === null) {
    return {
      used,
      limit,
      remaining: null,
      percent: 0,
      reached: false,
      label,
    };
  }

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    percent: limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0,
    reached: used >= limit,
    label,
  };
}

export function formatUsageShort(progress: UsageProgress) {
  if (progress.limit === null) {
    return `${progress.used} / illimitato`;
  }

  return `${progress.used} / ${progress.limit}`;
}

export function buildPlanLimitMessage(
  planId: RuntimePlanId,
  resource: PlanResourceKey,
  limit: LimitValue,
) {
  const plan = PLAN_LIMITS[planId];
  const resourceLabel = RESOURCE_LABELS[resource];
  const limitLabel = limit === null ? "illimitato" : String(limit);

  if (plan.nextUpgrade) {
    return `Hai raggiunto il limite del piano ${plan.label} per ${resourceLabel} (${limitLabel}). Passa a ${PLAN_LIMITS[plan.nextUpgrade].label} per continuare.`;
  }

  return `Hai raggiunto il limite del piano ${plan.label} per ${resourceLabel} (${limitLabel}). Contatta il supporto per aumentare la capacita.`;
}

export async function countPlanResourceUsage(
  supabase: SupabaseClient,
  userId: string,
  resource: Exclude<PlanResourceKey, "aiDailyCredits">,
) {
  const table = RESOURCE_TABLES[resource];
  if (!table) {
    return 0;
  }

  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function checkPlanResourceLimit(
  supabase: SupabaseClient,
  input: {
    userId: string;
    planId: RuntimePlanId;
    resource: Exclude<PlanResourceKey, "aiDailyCredits">;
    incomingUnits?: number;
  },
): Promise<PlanLimitStatus> {
  const limit = PLAN_LIMITS[input.planId][input.resource];
  const used = await countPlanResourceUsage(supabase, input.userId, input.resource);

  if (limit === null) {
    return {
      allowed: true,
      planId: input.planId,
      resource: input.resource,
      used,
      limit,
      remaining: null,
    };
  }

  const incomingUnits = input.incomingUnits ?? 1;
  const remaining = Math.max(0, limit - used);
  if (used + incomingUnits > limit) {
    return {
      allowed: false,
      planId: input.planId,
      resource: input.resource,
      used,
      limit,
      remaining,
      message: buildPlanLimitMessage(input.planId, input.resource, limit),
      upgradePlan: PLAN_LIMITS[input.planId].nextUpgrade,
      upgradeUrl: "/dashboard/billing",
    };
  }

  return {
    allowed: true,
    planId: input.planId,
    resource: input.resource,
    used,
    limit,
    remaining,
  };
}

export async function getPlanUsageSummary(
  supabase: SupabaseClient,
  input: {
    userId: string;
    subscriptionTier?: string | null;
  },
): Promise<PlanUsageSummary> {
  const planId = normalizePlanId(input.subscriptionTier);
  const limits = PLAN_LIMITS[planId];
  const usageDate = getCurrentUsageDate();

  const [
    businessProfiles,
    savedContents,
    calendars,
    crmClients,
    generatedContents,
    { data: aiUsageRow },
  ] = await Promise.all([
    countPlanResourceUsage(supabase, input.userId, "businessProfiles"),
    countPlanResourceUsage(supabase, input.userId, "savedContents"),
    countPlanResourceUsage(supabase, input.userId, "calendars"),
    countPlanResourceUsage(supabase, input.userId, "crmClients"),
    countPlanResourceUsage(supabase, input.userId, "generatedContents"),
    supabase
      .from("ai_usage_daily")
      .select("generation_count,total_tokens")
      .eq("user_id", input.userId)
      .eq("usage_date", usageDate)
      .maybeSingle(),
  ]);

  const aiCreditsToday = aiUsageRow?.generation_count ?? 0;
  const aiTokensToday = aiUsageRow?.total_tokens ?? 0;

  return {
    planId,
    limits,
    counts: {
      aiCreditsToday,
      aiTokensToday,
      businessProfiles,
      savedContents,
      calendars,
      crmClients,
      generatedContents,
    },
    progress: {
      aiCreditsToday: buildUsageProgress(aiCreditsToday, limits.aiDailyCredits, "Crediti AI oggi"),
      businessProfiles: buildUsageProgress(
        businessProfiles,
        limits.businessProfiles,
        "Business profile",
      ),
      savedContents: buildUsageProgress(savedContents, limits.savedContents, "Contenuti salvati"),
      calendars: buildUsageProgress(calendars, limits.calendars, "Calendari"),
      crmClients: buildUsageProgress(crmClients, limits.crmClients, "Clienti CRM"),
      generatedContents: buildUsageProgress(
        generatedContents,
        limits.generatedContents,
        "Generazioni AI",
      ),
    },
  };
}
