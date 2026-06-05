import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FeedbackWorkspace } from "@/components/dashboard/FeedbackWorkspace";
import type { FeedbackItem, FeedbackStatusEvent } from "@/lib/feedback";
import { requireDashboardUser } from "@/lib/saas";

export default async function FeedbackPage() {
  const { supabase, user } = await requireDashboardUser();
  const [{ data: feedbackData }, { data: eventsData }] = await Promise.all([
    supabase
      .from("feedback_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("feedback_status_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <DashboardShell
      title="Feedback"
      description="Raccogli feedback reali, segnala bug o frizioni d'uso e segui come il team li trasforma in roadmap concreta."
      userEmail={user.email ?? "utente"}
    >
      <FeedbackWorkspace
        initialFeedback={(feedbackData as FeedbackItem[] | null) ?? []}
        initialStatusEvents={(eventsData as FeedbackStatusEvent[] | null) ?? []}
      />
    </DashboardShell>
  );
}
