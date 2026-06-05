import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { normalizePlanId } from "@/lib/plan-limits";
import {
  type AdminFeedbackItem,
  type FeedbackItem,
  type FeedbackStatus,
} from "@/lib/feedback";

type ProfileRow = {
  id: string;
  email: string | null;
  subscription_tier: string | null;
};

function assertAdminSupabase() {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY non configurata.");
  }

  return supabase;
}

export async function listAdminFeedbackItems() {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return {
      configured: false,
      feedback: [] as AdminFeedbackItem[],
    };
  }

  const [feedbackResult, profilesResult] = await Promise.all([
    supabase.from("feedback_items").select("*").order("created_at", { ascending: false }).limit(1000),
    supabase.from("profiles").select("id,email,subscription_tier"),
  ]);

  if (feedbackResult.error) {
    console.error("Admin feedback list error:", feedbackResult.error);
  }

  if (profilesResult.error) {
    console.error("Admin feedback profiles error:", profilesResult.error);
  }

  const profilesMap = new Map<string, ProfileRow>(
    (((profilesResult.data as ProfileRow[] | null) ?? [])).map((profile) => [profile.id, profile]),
  );

  const feedback = (((feedbackResult.data as FeedbackItem[] | null) ?? [])).map((item) => {
    const profile = profilesMap.get(item.user_id);
    return {
      ...item,
      userEmail: profile?.email ?? null,
      planId: normalizePlanId(profile?.subscription_tier),
    };
  });

  return {
    configured: true,
    feedback,
  };
}

export async function getAdminFeedbackItem(feedbackId: string) {
  const supabase = assertAdminSupabase();

  const { data, error } = await supabase.from("feedback_items").select("*").eq("id", feedbackId).single();

  if (error) {
    throw error;
  }

  return data as FeedbackItem;
}

export async function getAdminFeedbackUserEmail(userId: string) {
  const supabase = assertAdminSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as { email: string | null } | null)?.email ?? null;
}

export async function updateAdminFeedbackItem(
  feedbackId: string,
  input: {
    status?: FeedbackStatus;
    adminNotes?: string | null;
  },
) {
  const supabase = assertAdminSupabase();

  const payload: {
    status?: FeedbackStatus;
    admin_notes?: string | null;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (input.status) {
    payload.status = input.status;
  }

  if (input.adminNotes !== undefined) {
    payload.admin_notes = input.adminNotes?.trim() || null;
  }

  const { data, error } = await supabase
    .from("feedback_items")
    .update(payload)
    .eq("id", feedbackId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as FeedbackItem;
}

export async function createAdminFeedbackStatusEvent(input: {
  feedbackId: string;
  userId: string;
  fromStatus: FeedbackStatus | null;
  toStatus: FeedbackStatus;
  noteSnapshot?: string | null;
}) {
  const supabase = assertAdminSupabase();

  const { error } = await supabase.from("feedback_status_events").insert({
    feedback_id: input.feedbackId,
    user_id: input.userId,
    from_status: input.fromStatus,
    to_status: input.toStatus,
    actor_type: "admin",
    note_snapshot: input.noteSnapshot?.trim() || null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

export async function deleteAdminFeedbackItem(feedbackId: string) {
  const supabase = assertAdminSupabase();

  const { error } = await supabase.from("feedback_items").delete().eq("id", feedbackId);

  if (error) {
    throw error;
  }
}
