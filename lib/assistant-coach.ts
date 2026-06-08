import type { SupabaseClient } from "@supabase/supabase-js";
import { buildBusinessProfileContext, type BusinessProfile } from "@/lib/business-profile";
import { resolveKnowledgePack } from "@/lib/knowledge-packs";
import { getPlanLimits, getCurrentUsageMonth, normalizePlanId, type RuntimePlanId } from "@/lib/plan-limits";

export type AssistantConversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type AssistantMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  created_at: string;
};

export type AssistantUsageStatus =
  | {
      allowed: true;
      planId: RuntimePlanId;
      usedThisMonth: number;
      monthlyLimit: number;
      remainingThisMonth: number;
    }
  | {
      allowed: false;
      planId: RuntimePlanId;
      usedThisMonth: number;
      monthlyLimit: number;
      remainingThisMonth: number;
      message: string;
      upgradePlan: "starter" | "pro" | "agency" | null;
      upgradeUrl: string;
    };

export type CoachSuggestion = {
  id: string;
  title: string;
  description: string;
  quickPrompt: string;
  severity: "info" | "warning" | "success";
};

export type AssistantBusinessSnapshot = {
  profile: BusinessProfile | null;
  counts: {
    crmClients: number;
    savedContents: number;
    calendars: number;
    generatedContents: number;
    aiCreditsToday: number;
    coachMessagesMonth: number;
  };
  latestCalendars: Array<{
    title: string;
    businessType: string | null;
    objective: string | null;
    periodDays: number;
    entries: Array<{
      date?: string;
      title?: string;
      format?: string;
      pillar?: string;
      cta?: string;
    }>;
  }>;
  recentGeneratedContents: Array<{
    type: string;
    title: string | null;
    created_at: string;
  }>;
  recentSavedContents: Array<{
    type: string;
    title: string;
    created_at: string;
  }>;
  recentClients: Array<{
    name: string;
    status: string;
    created_at: string;
  }>;
  subscription: {
    planId: RuntimePlanId;
    status: string | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
  };
};

export function buildAssistantLimitMessage(planId: RuntimePlanId, limit: number) {
  const plan = getPlanLimits(planId);
  if (plan.nextUpgrade) {
    return `Hai raggiunto il limite del piano ${plan.label} per i messaggi Coach mensili (${limit}). Passa a ${getPlanLimits(plan.nextUpgrade).label} per continuare.`;
  }

  return `Hai raggiunto il limite del piano ${plan.label} per i messaggi Coach mensili (${limit}). Contatta il supporto per aumentare la capacita.`;
}

export async function checkAssistantUsageAccess(
  supabase: SupabaseClient,
  userId: string,
  subscriptionTier?: string | null,
): Promise<AssistantUsageStatus> {
  const planId = normalizePlanId(subscriptionTier);
  const monthlyLimit = getPlanLimits(planId).coachMessagesMonthly;
  const monthStartIso = `${getCurrentUsageMonth()}-01T00:00:00.000Z`;

  const { count, error } = await supabase
    .from("assistant_messages")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", monthStartIso);

  if (error) {
    throw error;
  }

  const usedThisMonth = count ?? 0;
  const remainingThisMonth = Math.max(0, monthlyLimit - usedThisMonth);

  if (usedThisMonth + 1 > monthlyLimit) {
    return {
      allowed: false,
      planId,
      usedThisMonth,
      monthlyLimit,
      remainingThisMonth,
      message: buildAssistantLimitMessage(planId, monthlyLimit),
      upgradePlan: getPlanLimits(planId).nextUpgrade,
      upgradeUrl: "/dashboard/billing",
    };
  }

  return {
    allowed: true,
    planId,
    usedThisMonth,
    monthlyLimit,
    remainingThisMonth,
  };
}

function truncate(value: string | null | undefined, maxLength = 180) {
  if (!value?.trim()) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}

function calendarEntriesPreview(value: unknown) {
  const payload =
    typeof value === "object" && value !== null
      ? (value as {
          objective?: string;
          businessType?: string;
          entries?: Array<{
            date?: string;
            title?: string;
            format?: string;
            pillar?: string;
            cta?: string;
          }>;
        })
      : null;

  return {
    objective: truncate(payload?.objective ?? null, 140),
    businessType:
      typeof payload?.businessType === "string" && payload.businessType.trim()
        ? payload.businessType
        : null,
    entries: (payload?.entries ?? []).slice(0, 6),
  };
}

export async function getAssistantBusinessSnapshot(
  supabase: SupabaseClient,
  userId: string,
  subscriptionTier?: string | null,
): Promise<AssistantBusinessSnapshot> {
  const today = new Date().toISOString().slice(0, 10);
  const planId = normalizePlanId(subscriptionTier);

  const [
    { data: profiles },
    { count: crmClients },
    { count: savedContents },
    { count: calendars },
    { count: generatedContents },
    { count: coachMessagesMonthCount },
    { data: aiUsageToday },
    { data: recentGeneratedContents },
    { data: recentSavedContents },
    { data: recentClients },
    { data: rawCalendars },
    { data: subscription },
  ] = await Promise.all([
    supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("saved_contents").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("content_calendars").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("generated_contents").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("assistant_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("role", "user")
      .gte("created_at", `${getCurrentUsageMonth()}-01T00:00:00.000Z`),
    supabase
      .from("ai_usage_daily")
      .select("generation_count")
      .eq("user_id", userId)
      .eq("usage_date", today)
      .maybeSingle(),
    supabase
      .from("generated_contents")
      .select("type,title,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("saved_contents")
      .select("type,title,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("clients")
      .select("name,status,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("content_calendars")
      .select("title,business_type,period_days,calendar_json")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("subscriptions")
      .select("plan_id,status,cancel_at_period_end,current_period_end")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const profile = (profiles as BusinessProfile[] | null | undefined)?.find((item) => item.is_primary) ??
    (profiles as BusinessProfile[] | null | undefined)?.[0] ??
    null;

  return {
    profile,
    counts: {
      crmClients: crmClients ?? 0,
      savedContents: savedContents ?? 0,
      calendars: calendars ?? 0,
      generatedContents: generatedContents ?? 0,
      aiCreditsToday: aiUsageToday?.generation_count ?? 0,
      coachMessagesMonth: coachMessagesMonthCount ?? 0,
    },
    latestCalendars: ((rawCalendars as Array<{
      title: string;
      business_type: string | null;
      period_days: number;
      calendar_json: unknown;
    }> | null) ?? []).map((item) => {
      const preview = calendarEntriesPreview(item.calendar_json);
      return {
        title: item.title,
        businessType: item.business_type ?? preview.businessType,
        objective: preview.objective,
        periodDays: item.period_days,
        entries: preview.entries,
      };
    }),
    recentGeneratedContents:
      ((recentGeneratedContents as AssistantBusinessSnapshot["recentGeneratedContents"] | null) ??
        []),
    recentSavedContents:
      ((recentSavedContents as AssistantBusinessSnapshot["recentSavedContents"] | null) ?? []),
    recentClients: ((recentClients as AssistantBusinessSnapshot["recentClients"] | null) ?? []),
    subscription: {
      planId,
      status: subscription?.status ?? null,
      cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
      currentPeriodEnd: subscription?.current_period_end ?? null,
    },
  };
}

function formatList(values: Array<string | null | undefined>, fallback = "nessun dato rilevante") {
  const filtered = values.map((item) => item?.trim()).filter(Boolean) as string[];
  return filtered.length > 0 ? filtered.join(", ") : fallback;
}

export function buildAssistantSystemPrompt(snapshot: AssistantBusinessSnapshot) {
  const activePack = resolveKnowledgePack(snapshot.profile);
  const profileContext = buildBusinessProfileContext(snapshot.profile) || "Business Profile non ancora completo.";
  const recentContentTypes = formatList(snapshot.recentGeneratedContents.slice(0, 6).map((item) => item.type));
  const savedTopics = formatList(snapshot.recentSavedContents.slice(0, 6).map((item) => item.title));
  const crmStatuses = formatList(snapshot.recentClients.slice(0, 8).map((item) => item.status));
  const calendarsSummary =
    snapshot.latestCalendars.length > 0
      ? snapshot.latestCalendars
          .map((calendar) => {
            const topEntries = calendar.entries
              .slice(0, 3)
              .map((entry) => `${entry.date ?? "data?"}: ${entry.title ?? "titolo?"} (${entry.format ?? "format?"})`)
              .join("; ");
            return `${calendar.title} | ${calendar.periodDays} giorni | obiettivo: ${calendar.objective ?? "n/d"} | sample: ${topEntries}`;
          })
          .join("\n")
      : "Nessun calendario disponibile.";

  return [
    "Sei BizKit AI Business Coach, un consulente marketing senior per attivita locali.",
    "Rispondi sempre in italiano.",
    "Devi dare consigli pratici, specifici, orientati ad azione e coerenti con i dati reali dell'utente.",
    "Non inventare metriche. Se un dato manca, dichiaralo e dai comunque un consiglio utile.",
    "Quando utile, organizza la risposta con: diagnosi, priorita, azioni immediate, idea campagna, CTA finale.",
    "Se l'utente chiede analisi calendario o contenuti, evidenzia gap, ripetizioni, angoli mancanti e opportunita.",
    "Se l'utente chiede CRM o clienti, suggerisci follow-up, win-back, referral, upsell o reminder concreti.",
    "Se l'utente chiede piu prenotazioni o lead, proponi campagne pratiche per i prossimi 7-30 giorni.",
    "Usa markdown semplice con titoli brevi e bullet quando aiuta la leggibilita.",
    `Knowledge pack attivo: ${activePack.label}.`,
    `Pilastri chiave della nicchia: ${activePack.contentPillars.join(", ")}.`,
    `Campagne stagionali rilevanti: ${activePack.seasonalCampaigns.join(", ")}.`,
    `Hint consulenziali prioritari: ${activePack.assistantHints.join(", ")}.`,
    profileContext,
    `Statistiche correnti: clienti CRM ${snapshot.counts.crmClients}, contenuti salvati ${snapshot.counts.savedContents}, calendari ${snapshot.counts.calendars}, generazioni AI ${snapshot.counts.generatedContents}, crediti AI usati oggi ${snapshot.counts.aiCreditsToday}, messaggi coach usati questo mese ${snapshot.counts.coachMessagesMonth}.`,
    `Tipi di contenuto generati di recente: ${recentContentTypes}.`,
    `Asset salvati di recente: ${savedTopics}.`,
    `Stati CRM recenti: ${crmStatuses}.`,
    `Ultimi calendari disponibili:\n${calendarsSummary}`,
    snapshot.subscription.cancelAtPeriodEnd && snapshot.subscription.currentPeriodEnd
      ? `Nota subscription: il piano attuale non si rinnovera e restera attivo fino al ${new Date(snapshot.subscription.currentPeriodEnd).toLocaleDateString("it-IT")}.`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function getCoachSuggestions(snapshot: AssistantBusinessSnapshot): CoachSuggestion[] {
  const suggestions: CoachSuggestion[] = [];
  const recentTypes = new Set(snapshot.recentGeneratedContents.slice(0, 12).map((item) => item.type));
  const hasCalendar = snapshot.counts.calendars > 0;
  const hasCRM = snapshot.counts.crmClients > 0;
  const noRecentContent =
    snapshot.recentGeneratedContents.length === 0 ||
    Date.now() - new Date(snapshot.recentGeneratedContents[0].created_at).getTime() >
      10 * 24 * 60 * 60 * 1000;

  if (recentTypes.size > 0 && !recentTypes.has("promo") && !recentTypes.has("sports_promo") && !recentTypes.has("hair_promo")) {
    suggestions.push({
      id: "missing-promo",
      title: "Ti manca una spinta commerciale",
      description: "Hai generato contenuti, ma quasi nessuna promo recente. Inserisci un contenuto di conversione per riempire i prossimi slot.",
      quickPrompt: "Dammi una promo per riempire il weekend.",
      severity: "warning",
    });
  }

  if (noRecentContent) {
    suggestions.push({
      id: "inactive-content",
      title: "Nessuna generazione recente",
      description: "Non risultano contenuti generati negli ultimi 10 giorni. Riparti da un piano rapido per riallineare pubblicazione e offerte.",
      quickPrompt: "Piano marketing 30 giorni per rilanciare il mio business.",
      severity: "warning",
    });
  }

  if (hasCRM && snapshot.counts.crmClients >= 25 && !recentTypes.has("sports_client_message") && !recentTypes.has("hair_client_message")) {
    suggestions.push({
      id: "crm-followup",
      title: "Hai clienti CRM ma pochi follow-up",
      description: "Con una base clienti gia presente puoi attivare subito win-back, referral e reminder mirati.",
      quickPrompt: "Come recupero clienti inattivi dal mio CRM?",
      severity: "info",
    });
  }

  if (hasCalendar) {
    suggestions.push({
      id: "calendar-review",
      title: "Fai leggere il calendario al Coach",
      description: "I tuoi ultimi planner possono essere analizzati per trovare buchi tra promo, educazione, recensioni e conversione.",
      quickPrompt: "Analizza il mio calendario e dimmi cosa manca.",
      severity: "success",
    });
  }

  if (!hasCRM) {
    suggestions.push({
      id: "crm-empty",
      title: "CRM ancora vuoto",
      description: "Senza lead o clienti salvati perdi occasioni di follow-up e riattivazione. Parti da una campagna per raccogliere contatti.",
      quickPrompt: "Ho pochi lead, cosa mi consigli per ottenere piu prenotazioni?",
      severity: "info",
    });
  }

  if (snapshot.profile && !snapshot.profile.preferred_cta?.trim()) {
    suggestions.push({
      id: "cta-missing",
      title: "CTA del business profile da rafforzare",
      description: "Aggiungi una CTA chiara nel Business Profile per rendere il Coach e i generatori piu orientati alla conversione.",
      quickPrompt: "Quale CTA dovrei usare per aumentare le prenotazioni?",
      severity: "info",
    });
  }

  return suggestions.slice(0, 4);
}

export function createConversationTitleFromPrompt(prompt: string) {
  const normalized = prompt.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "Nuova conversazione";
  }

  return normalized.length > 48 ? `${normalized.slice(0, 47)}…` : normalized;
}
