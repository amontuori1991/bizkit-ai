import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FeedbackWorkspace } from "@/components/dashboard/FeedbackWorkspace";
import type { FeedbackItem } from "@/lib/feedback";
import { requireDashboardUser } from "@/lib/saas";

export default async function FeedbackPage() {
  const { supabase, user } = await requireDashboardUser();
  const { data } = await supabase
    .from("feedback_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardShell
      title="Feedback"
      description="Raccogli feedback reali, segnala bug o frizioni d'uso e segui come il team li trasforma in roadmap concreta."
      userEmail={user.email ?? "utente"}
    >
      <FeedbackWorkspace initialFeedback={(data as FeedbackItem[] | null) ?? []} />
    </DashboardShell>
  );
}

