import { AssistantWorkspace } from "@/components/dashboard/AssistantWorkspace";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getAssistantBusinessSnapshot,
  getCoachSuggestions,
  type AssistantConversation,
  type AssistantMessage,
} from "@/lib/assistant-coach";
import { getPlanLimits } from "@/lib/plan-limits";
import { requireDashboardUser } from "@/lib/saas";

type AssistantPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AssistantPage({ searchParams }: AssistantPageProps) {
  const { supabase, user } = await requireDashboardUser();
  const params = searchParams ? await searchParams : {};
  const rawPrompt = params.prompt;
  const initialPrompt = Array.isArray(rawPrompt) ? rawPrompt[0] : rawPrompt;
  const [{ data: profile }, { data: conversations }] = await Promise.all([
    supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle(),
    supabase
      .from("assistant_conversations")
      .select("id,user_id,title,created_at,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(30),
  ]);

  const initialConversation = (conversations as AssistantConversation[] | null)?.[0] ?? null;
  const { data: messages } = initialConversation
    ? await supabase
        .from("assistant_messages")
        .select("id,conversation_id,user_id,role,content,input_tokens,output_tokens,total_tokens,created_at")
        .eq("user_id", user.id)
        .eq("conversation_id", initialConversation.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  const snapshot = await getAssistantBusinessSnapshot(supabase, user.id, profile?.subscription_tier);
  const coachSuggestions = getCoachSuggestions(snapshot);
  const monthlyLimit = getPlanLimits(snapshot.subscription.planId).coachMessagesMonthly;

  return (
    <DashboardShell
      title="AI Business Coach"
      description="Un assistente marketing persistente che legge il tuo business profile, i contenuti, il CRM e i calendari per darti consigli operativi."
      userEmail={user.email ?? "utente"}
    >
      <AssistantWorkspace
        initialConversations={(conversations as AssistantConversation[] | null) ?? []}
        initialConversationId={initialConversation?.id ?? null}
        initialMessages={(messages as AssistantMessage[] | null) ?? []}
        coachSuggestions={coachSuggestions}
        initialPrompt={initialPrompt ?? null}
        usage={{
          planId: snapshot.subscription.planId,
          usedThisMonth: snapshot.counts.coachMessagesMonth,
          monthlyLimit,
          remainingThisMonth: Math.max(0, monthlyLimit - snapshot.counts.coachMessagesMonth),
        }}
      />
    </DashboardShell>
  );
}
