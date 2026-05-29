import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { normalizePlanId } from "@/lib/plan-limits";

type DailyPoint = {
  date: string;
  count: number;
};

type BusinessTypePoint = {
  label: string;
  count: number;
};

type CreditUsagePoint = {
  planId: string;
  creditsUsed: number;
  totalTokens: number;
};

export type AdminAnalyticsData = {
  configured: boolean;
  summary: {
    registeredUsers: number;
    activeUsers7d: number;
    calendarsGenerated: number;
    savedContents: number;
    upgradedUsers: number;
    freeToPaidConversionRate: number;
    starterUsers: number;
    proUsers: number;
    agencyUsers: number;
    averageCreditsUsed: number;
    averageStorageUsed: number;
    averageCalendarsUsed: number;
  };
  dailyGenerations: DailyPoint[];
  businessTypes: BusinessTypePoint[];
  topBusinessType: BusinessTypePoint | null;
  creditUsageByPlan: CreditUsagePoint[];
};

type ProfileRow = {
  subscription_tier: string | null;
};

type BusinessProfileRow = {
  business_type: string | null;
};

type RequestLogRow = {
  user_id: string;
  created_at: string;
  status: string;
};

type UsageRow = {
  user_id: string;
  plan_id: string | null;
  generation_count: number | null;
  total_tokens: number | null;
};

function formatDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getLast7Days() {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return formatDay(date);
  });
}

function formatBusinessTypeLabel(value: string | null) {
  switch (value) {
    case "gym":
      return "Palestra";
    case "personal_trainer":
      return "Personal trainer";
    case "fitness_studio":
      return "Studio fitness";
    case "hair_salon":
      return "Salone parrucchieri";
    case "barber_shop":
      return "Barber shop";
    case "hair_stylist":
      return "Hair stylist";
    default:
      return value?.trim() || "Non impostato";
  }
}

async function getProfiles() {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return [] as ProfileRow[];
  }

  const { data, error } = await supabase.from("profiles").select("subscription_tier");
  if (error) {
    console.error("Admin analytics profiles error:", error);
    return [] as ProfileRow[];
  }

  return (data as ProfileRow[] | null) ?? [];
}

async function getBusinessProfiles() {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return [] as BusinessProfileRow[];
  }

  const { data, error } = await supabase.from("business_profiles").select("business_type");
  if (error) {
    console.error("Admin analytics business profiles error:", error);
    return [] as BusinessProfileRow[];
  }

  return (data as BusinessProfileRow[] | null) ?? [];
}

async function getRequestLogs() {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return [] as RequestLogRow[];
  }

  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("ai_request_logs")
    .select("user_id, created_at, status")
    .gte("created_at", since.toISOString());

  if (error) {
    console.error("Admin analytics request logs error:", error);
    return [] as RequestLogRow[];
  }

  return (data as RequestLogRow[] | null) ?? [];
}

async function getCount(table: "content_calendars" | "saved_contents") {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) {
    console.error(`Admin analytics count error for ${table}:`, error);
    return 0;
  }

  return count ?? 0;
}

async function getUsageRows() {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return [] as UsageRow[];
  }

  const { data, error } = await supabase
    .from("ai_usage_daily")
    .select("user_id, plan_id, generation_count, total_tokens");

  if (error) {
    console.error("Admin analytics usage rows error:", error);
    return [] as UsageRow[];
  }

  return (data as UsageRow[] | null) ?? [];
}

async function getOwnerRows(table: "content_calendars" | "saved_contents") {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return [] as Array<{ user_id: string }>;
  }

  const { data, error } = await supabase.from(table).select("user_id");
  if (error) {
    console.error(`Admin analytics owner rows error for ${table}:`, error);
    return [] as Array<{ user_id: string }>;
  }

  return (data as Array<{ user_id: string }> | null) ?? [];
}

export async function getAdminAnalyticsData(): Promise<AdminAnalyticsData> {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return {
      configured: false,
      summary: {
        registeredUsers: 0,
        activeUsers7d: 0,
        calendarsGenerated: 0,
        savedContents: 0,
        upgradedUsers: 0,
        freeToPaidConversionRate: 0,
        starterUsers: 0,
        proUsers: 0,
        agencyUsers: 0,
        averageCreditsUsed: 0,
        averageStorageUsed: 0,
        averageCalendarsUsed: 0,
      },
      dailyGenerations: getLast7Days().map((date) => ({ date, count: 0 })),
      businessTypes: [],
      topBusinessType: null,
      creditUsageByPlan: [],
    };
  }

  const [
    profiles,
    businessProfiles,
    requestLogs,
    calendarsGenerated,
    savedContents,
    usageRows,
    savedContentOwners,
    calendarOwners,
  ] =
    await Promise.all([
      getProfiles(),
      getBusinessProfiles(),
      getRequestLogs(),
      getCount("content_calendars"),
      getCount("saved_contents"),
      getUsageRows(),
      getOwnerRows("saved_contents"),
      getOwnerRows("content_calendars"),
    ]);

  const registeredUsers = profiles.length;
  const starterUsers = profiles.filter((profile) => normalizePlanId(profile.subscription_tier) === "starter").length;
  const proUsers = profiles.filter((profile) => normalizePlanId(profile.subscription_tier) === "pro").length;
  const agencyUsers = profiles.filter((profile) => normalizePlanId(profile.subscription_tier) === "agency").length;
  const upgradedUsers = starterUsers + proUsers + agencyUsers;
  const freeToPaidConversionRate =
    registeredUsers > 0 ? Math.round((upgradedUsers / registeredUsers) * 1000) / 10 : 0;

  const activeUsers7d = new Set(
    requestLogs.filter((item) => item.status === "success").map((item) => item.user_id),
  ).size;

  const dayBuckets = new Map<string, number>();
  for (const day of getLast7Days()) {
    dayBuckets.set(day, 0);
  }

  requestLogs
    .filter((item) => item.status === "success")
    .forEach((item) => {
      const day = item.created_at.slice(0, 10);
      dayBuckets.set(day, (dayBuckets.get(day) ?? 0) + 1);
    });

  const dailyGenerations = Array.from(dayBuckets.entries()).map(([date, count]) => ({ date, count }));

  const businessTypeCounts = new Map<string, number>();
  businessProfiles.forEach((row) => {
    const label = formatBusinessTypeLabel(row.business_type);
    businessTypeCounts.set(label, (businessTypeCounts.get(label) ?? 0) + 1);
  });

  const businessTypes = Array.from(businessTypeCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((first, second) => second.count - first.count);

  const topBusinessType = businessTypes[0] ?? null;

  const usageByPlan = new Map<string, CreditUsagePoint>();
  usageRows.forEach((row) => {
    const planId = normalizePlanId(row.plan_id);
    const current = usageByPlan.get(planId) ?? {
      planId,
      creditsUsed: 0,
      totalTokens: 0,
    };

    current.creditsUsed += row.generation_count ?? 0;
    current.totalTokens += row.total_tokens ?? 0;
    usageByPlan.set(planId, current);
  });

  const creditUsageByPlan = Array.from(usageByPlan.values()).sort((first, second) => {
    const order = { free: 0, starter: 1, pro: 2, agency: 3 };
    return (order[first.planId as keyof typeof order] ?? 99) - (order[second.planId as keyof typeof order] ?? 99);
  });

  const uniqueUsageUsers = new Set(usageRows.map((row) => row.user_id)).size;
  const uniqueSavedUsers = new Set(savedContentOwners.map((row) => row.user_id)).size;
  const uniqueCalendarUsers = new Set(calendarOwners.map((row) => row.user_id)).size;
  const totalCreditsUsed = usageRows.reduce((sum, row) => sum + (row.generation_count ?? 0), 0);

  const averageCreditsUsed =
    uniqueUsageUsers > 0 ? Math.round((totalCreditsUsed / uniqueUsageUsers) * 10) / 10 : 0;
  const averageStorageUsed =
    uniqueSavedUsers > 0 ? Math.round((savedContents / uniqueSavedUsers) * 10) / 10 : 0;
  const averageCalendarsUsed =
    uniqueCalendarUsers > 0 ? Math.round((calendarsGenerated / uniqueCalendarUsers) * 10) / 10 : 0;

  return {
    configured: true,
    summary: {
      registeredUsers,
      activeUsers7d,
      calendarsGenerated,
      savedContents,
      upgradedUsers,
      freeToPaidConversionRate,
      starterUsers,
      proUsers,
      agencyUsers,
      averageCreditsUsed,
      averageStorageUsed,
      averageCalendarsUsed,
    },
    dailyGenerations,
    businessTypes,
    topBusinessType,
    creditUsageByPlan,
  };
}
