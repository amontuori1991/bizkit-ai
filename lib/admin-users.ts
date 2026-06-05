import { cookies } from "next/headers";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { normalizePlanId, type RuntimePlanId } from "@/lib/plan-limits";

export type ManagedAdminUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  businessName: string | null;
  planId: RuntimePlanId;
  createdAt: string;
  lastAccessAt: string | null;
  businessProfilesCount: number;
  generatedContentsCount: number;
  savedContentsCount: number;
  calendarsCount: number;
  crmClientsCount: number;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasTestData: boolean;
};

type RowWithUserId = {
  user_id: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  business_name: string | null;
  subscription_tier: string | null;
  created_at: string;
};

type SubscriptionRow = {
  user_id: string;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  created_at: string;
};

function countByUser(rows: RowWithUserId[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }

  return counts;
}

function containsTestValue(...values: Array<string | null | undefined>) {
  return values.some((value) => {
    const normalized = value?.toLowerCase().trim();
    if (!normalized) {
      return false;
    }

    return (
      normalized.includes("[test") ||
      normalized.includes("test limit") ||
      normalized.includes("@example.com") ||
      normalized.includes("starter-test-") ||
      normalized.includes("pro-test-")
    );
  });
}

function assertAdminSupabase() {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY non configurata.");
  }

  return supabase;
}

export async function requireAdminRequest() {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    throw new Error("NON_AUTHORIZED");
  }
}

export async function listManagedAdminUsers() {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return {
      configured: false,
      users: [] as ManagedAdminUser[],
    };
  }

  const [
    profilesResult,
    authUsersResult,
    businessProfilesCountResult,
    generatedContentsCountResult,
    savedContentsCountResult,
    calendarsCountResult,
    clientsCountResult,
    subscriptionsResult,
    businessProfilesTestRows,
    savedContentsTestRows,
    calendarTestRows,
    clientTestRows,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, business_name, subscription_tier, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.auth.admin.listUsers({ page: 1, perPage: 500 }),
    supabase.from("business_profiles").select("user_id"),
    supabase.from("generated_contents").select("user_id"),
    supabase.from("saved_contents").select("user_id"),
    supabase.from("content_calendars").select("user_id"),
    supabase.from("clients").select("user_id"),
    supabase
      .from("subscriptions")
      .select("user_id, status, current_period_end, cancel_at_period_end, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("business_profiles").select("user_id, business_name"),
    supabase.from("saved_contents").select("user_id, title, content"),
    supabase.from("content_calendars").select("user_id, title"),
    supabase.from("clients").select("user_id, name, email, notes"),
  ]);

  if (profilesResult.error) {
    console.error("Admin users profiles error:", profilesResult.error);
  }

  if (authUsersResult.error) {
    console.error("Admin auth users error:", authUsersResult.error);
  }

  const profiles = (profilesResult.data as ProfileRow[] | null) ?? [];
  const authUsers = authUsersResult.data?.users ?? [];

  const lastAccessMap = new Map<string, string | null>(
    authUsers.map((user) => [user.id, user.last_sign_in_at ?? null]),
  );

  const businessProfilesCount = countByUser(
    (businessProfilesCountResult.data as RowWithUserId[] | null) ?? [],
  );
  const generatedContentsCount = countByUser(
    (generatedContentsCountResult.data as RowWithUserId[] | null) ?? [],
  );
  const savedContentsCount = countByUser(
    (savedContentsCountResult.data as RowWithUserId[] | null) ?? [],
  );
  const calendarsCount = countByUser(
    (calendarsCountResult.data as RowWithUserId[] | null) ?? [],
  );
  const clientsCount = countByUser((clientsCountResult.data as RowWithUserId[] | null) ?? []);

  const subscriptionMap = new Map<string, SubscriptionRow>();
  for (const row of ((subscriptionsResult.data as SubscriptionRow[] | null) ?? [])) {
    if (!subscriptionMap.has(row.user_id)) {
      subscriptionMap.set(row.user_id, row);
    }
  }

  const testDataUsers = new Set<string>();

  for (const row of ((businessProfilesTestRows.data as Array<{ user_id: string; business_name: string | null }> | null) ?? [])) {
    if (containsTestValue(row.business_name)) {
      testDataUsers.add(row.user_id);
    }
  }

  for (const row of ((savedContentsTestRows.data as Array<{ user_id: string; title: string | null; content: string | null }> | null) ?? [])) {
    if (containsTestValue(row.title, row.content)) {
      testDataUsers.add(row.user_id);
    }
  }

  for (const row of ((calendarTestRows.data as Array<{ user_id: string; title: string | null }> | null) ?? [])) {
    if (containsTestValue(row.title)) {
      testDataUsers.add(row.user_id);
    }
  }

  for (const row of ((clientTestRows.data as Array<{ user_id: string; name: string | null; email: string | null; notes: string | null }> | null) ?? [])) {
    if (containsTestValue(row.name, row.email, row.notes)) {
      testDataUsers.add(row.user_id);
    }
  }

  const users: ManagedAdminUser[] = profiles.map((profile) => {
    const subscription = subscriptionMap.get(profile.id);
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      businessName: profile.business_name,
      planId: normalizePlanId(profile.subscription_tier),
      createdAt: profile.created_at,
      lastAccessAt: lastAccessMap.get(profile.id) ?? null,
      businessProfilesCount: businessProfilesCount.get(profile.id) ?? 0,
      generatedContentsCount: generatedContentsCount.get(profile.id) ?? 0,
      savedContentsCount: savedContentsCount.get(profile.id) ?? 0,
      calendarsCount: calendarsCount.get(profile.id) ?? 0,
      crmClientsCount: clientsCount.get(profile.id) ?? 0,
      subscriptionStatus: subscription?.status ?? null,
      currentPeriodEnd: subscription?.current_period_end ?? null,
      cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
      hasTestData: testDataUsers.has(profile.id),
    };
  });

  return {
    configured: true,
    users,
  };
}

export async function updateManagedUserPlan(userId: string, planId: RuntimePlanId) {
  const supabase = assertAdminSupabase();

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_tier: planId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export async function resetManagedUserUsageToday(userId: string) {
  const supabase = assertAdminSupabase();
  const usageDate = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("ai_usage_daily")
    .delete()
    .eq("user_id", userId)
    .eq("usage_date", usageDate);

  if (error) {
    throw error;
  }
}

export type ManagedUserDataAction =
  | "test-data"
  | "saved-contents"
  | "calendars"
  | "crm-clients"
  | "business-profiles"
  | "local-subscription";

export async function deleteManagedUserData(userId: string, action: ManagedUserDataAction) {
  const supabase = assertAdminSupabase();

  if (action === "test-data") {
    const [businessProfilesRows, savedContentsRows, calendarRows, clientRows] = await Promise.all([
      supabase.from("business_profiles").select("id, business_name").eq("user_id", userId),
      supabase.from("saved_contents").select("id, title, content").eq("user_id", userId),
      supabase.from("content_calendars").select("id, title").eq("user_id", userId),
      supabase.from("clients").select("id, name, email, notes").eq("user_id", userId),
    ]);

    const businessProfileIds =
      businessProfilesRows.data
        ?.filter((row) => containsTestValue(row.business_name))
        .map((row) => row.id) ?? [];
    const savedContentIds =
      savedContentsRows.data
        ?.filter((row) => containsTestValue(row.title, row.content))
        .map((row) => row.id) ?? [];
    const calendarIds =
      calendarRows.data
        ?.filter((row) => containsTestValue(row.title))
        .map((row) => row.id) ?? [];
    const clientIds =
      clientRows.data
        ?.filter((row) => containsTestValue(row.name, row.email, row.notes))
        .map((row) => row.id) ?? [];

    const deleteOps = [];
    if (businessProfileIds.length > 0) {
      deleteOps.push(supabase.from("business_profiles").delete().in("id", businessProfileIds));
    }
    if (savedContentIds.length > 0) {
      deleteOps.push(supabase.from("saved_contents").delete().in("id", savedContentIds));
    }
    if (calendarIds.length > 0) {
      deleteOps.push(supabase.from("content_calendars").delete().in("id", calendarIds));
    }
    if (clientIds.length > 0) {
      deleteOps.push(supabase.from("clients").delete().in("id", clientIds));
    }

    const results = await Promise.all(deleteOps);
    const failing = results.find((result) => result.error);
    if (failing?.error) {
      throw failing.error;
    }
    return;
  }

  if (action === "saved-contents") {
    const { error } = await supabase.from("saved_contents").delete().eq("user_id", userId);
    if (error) throw error;
    return;
  }

  if (action === "calendars") {
    const { error } = await supabase.from("content_calendars").delete().eq("user_id", userId);
    if (error) throw error;
    return;
  }

  if (action === "crm-clients") {
    const { error } = await supabase.from("clients").delete().eq("user_id", userId);
    if (error) throw error;
    return;
  }

  if (action === "business-profiles") {
    const { error } = await supabase.from("business_profiles").delete().eq("user_id", userId);
    if (error) throw error;
    return;
  }

  if (action === "local-subscription") {
    const [subscriptionDelete, profileUpdate] = await Promise.all([
      supabase.from("subscriptions").delete().eq("user_id", userId),
      supabase
        .from("profiles")
        .update({
          subscription_tier: "free",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId),
    ]);

    if (subscriptionDelete.error) throw subscriptionDelete.error;
    if (profileUpdate.error) throw profileUpdate.error;
  }
}

export async function deleteManagedUserCompletely(userId: string) {
  const supabase = assertAdminSupabase();

  const operations = [
    supabase.from("subscriptions").delete().eq("user_id", userId),
    supabase.from("customers").delete().eq("user_id", userId),
    supabase.from("downloads").delete().eq("user_id", userId),
    supabase.from("orders").delete().eq("user_id", userId),
    supabase.from("email_logs").delete().eq("user_id", userId),
    supabase.from("feedback_items").delete().eq("user_id", userId),
    supabase.from("business_profiles").delete().eq("user_id", userId),
    supabase.from("generated_contents").delete().eq("user_id", userId),
    supabase.from("saved_contents").delete().eq("user_id", userId),
    supabase.from("content_calendars").delete().eq("user_id", userId),
    supabase.from("clients").delete().eq("user_id", userId),
    supabase.from("ai_usage_daily").delete().eq("user_id", userId),
    supabase.from("ai_request_logs").delete().eq("user_id", userId),
    supabase.from("profiles").delete().eq("id", userId),
  ];

  const results = await Promise.all(operations);
  const failing = results.find((result) => result.error);
  if (failing?.error) {
    throw failing.error;
  }

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    throw error;
  }
}
