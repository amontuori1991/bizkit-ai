"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardIcon } from "@/components/dashboard/DashboardIcon";
import { FloatingFeedback } from "@/components/ui/FloatingFeedback";
import { SimpleMarkdown } from "@/components/ui/SimpleMarkdown";
import type {
  AssistantConversation,
  AssistantMessage,
  CoachSuggestion,
} from "@/lib/assistant-coach";

type AssistantWorkspaceProps = {
  initialConversations: AssistantConversation[];
  initialConversationId: string | null;
  initialMessages: AssistantMessage[];
  coachSuggestions: CoachSuggestion[];
  initialPrompt?: string | null;
  usage: {
    planId: string;
    usedThisMonth: number;
    monthlyLimit: number;
    remainingThisMonth: number;
  };
};

type ConversationsResponse = {
  conversations?: AssistantConversation[];
  error?: string;
};

type ConversationDetailResponse = {
  conversation?: AssistantConversation;
  messages?: AssistantMessage[];
  error?: string;
};

type SendMessageResponse = {
  message?: AssistantMessage;
  error?: string;
  usage?: AssistantWorkspaceProps["usage"];
  upgradePlan?: string | null;
  upgradeUrl?: string | null;
};

const QUICK_ACTIONS = [
  "Analizza il mio business",
  "Analizza il calendario",
  "Recupera clienti inattivi",
  "Dammi una promo",
  "Idee Reel",
  "Idee Story",
  "Piano marketing 30 giorni",
];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AssistantWorkspace({
  initialConversations,
  initialConversationId,
  initialMessages,
  coachSuggestions,
  initialPrompt = null,
  usage: initialUsage,
}: AssistantWorkspaceProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [usage, setUsage] = useState(initialUsage);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [upgradePlan, setUpgradePlan] = useState<string | null>(null);
  const [upgradeUrl, setUpgradeUrl] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  useEffect(() => {
    if (initialPrompt && messages.length === 0 && !isSending) {
      setInput(initialPrompt);
      void handleSend(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  async function refreshConversations(nextConversationId?: string | null) {
    const response = await fetch("/api/assistant/conversations", {
      method: "GET",
      cache: "no-store",
    });
    const data = (await response.json()) as ConversationsResponse;
    if (response.ok && data.conversations) {
      setConversations(data.conversations);
      if (nextConversationId) {
        setActiveConversationId(nextConversationId);
      }
    }
  }

  async function loadConversation(conversationId: string) {
    setIsLoadingConversation(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/assistant/conversations/${conversationId}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json()) as ConversationDetailResponse;
      if (!response.ok || !data.messages) {
        throw new Error(data.error ?? "Impossibile caricare la conversazione.");
      }

      setActiveConversationId(conversationId);
      setMessages(data.messages);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Errore durante il caricamento della chat.",
      );
    } finally {
      setIsLoadingConversation(false);
    }
  }

  async function createConversation(seedPrompt?: string) {
    const response = await fetch("/api/assistant/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: seedPrompt ?? undefined }),
    });

    const data = (await response.json()) as {
      conversation?: AssistantConversation;
      error?: string;
    };

    if (!response.ok || !data.conversation) {
      throw new Error(data.error ?? "Impossibile creare una nuova conversazione.");
    }

    await refreshConversations(data.conversation.id);
    setMessages([]);
    return data.conversation.id;
  }

  async function handleSend(promptOverride?: string) {
    const content = (promptOverride ?? input).trim();
    if (!content) {
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setMessage(null);
    setUpgradePlan(null);
    setUpgradeUrl(null);

    const optimisticMessage: AssistantMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversationId ?? "pending",
      user_id: "me",
      role: "user",
      content,
      input_tokens: null,
      output_tokens: null,
      total_tokens: null,
      created_at: new Date().toISOString(),
    };

    const previousMessages = messages;
    setMessages((current) => [...current, optimisticMessage]);
    setInput("");

    try {
      const conversationId = activeConversationId ?? (await createConversation(content));
      if (!activeConversationId) {
        setActiveConversationId(conversationId);
      }

      const response = await fetch(`/api/assistant/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = (await response.json()) as SendMessageResponse;
      if (!response.ok || !data.message) {
        setUpgradePlan(data.upgradePlan ?? null);
        setUpgradeUrl(data.upgradeUrl ?? null);
        throw new Error(data.error ?? "Errore durante la risposta del Coach.");
      }

      setMessages((current) => {
        const withoutTemp = current.filter((item) => item.id !== optimisticMessage.id);
        return [
          ...withoutTemp,
          {
            ...optimisticMessage,
            conversation_id: conversationId,
          },
          data.message as AssistantMessage,
        ];
      });
      if (data.usage) {
        setUsage(data.usage);
        setMessage(
          `Coach attivo. ${data.usage.usedThisMonth}/${data.usage.monthlyLimit} messaggi usati questo mese.`,
        );
      }
      await refreshConversations(conversationId);
    } catch (error) {
      setMessages(previousMessages);
      setErrorMessage(
        error instanceof Error ? error.message : "Errore durante l'invio del messaggio.",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleCopyResponse(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setMessage("Risposta copiata negli appunti.");
    } catch {
      setErrorMessage("Impossibile copiare la risposta.");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <FloatingFeedback type="success" message={message} onClose={() => setMessage(null)} />
      <FloatingFeedback type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />

      <aside className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Coach usage
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">Messaggi del mese</h2>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {usage.planId.toUpperCase()}
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-950">
            {usage.usedThisMonth} / {usage.monthlyLimit}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Restano {usage.remainingThisMonth} messaggi Coach in questo mese.
          </p>
          {upgradePlan ? (
            <a
              href={upgradeUrl ?? "/dashboard/billing"}
              className="mt-4 inline-flex text-sm font-semibold text-blue-700 underline underline-offset-4"
            >
              Passa a {upgradePlan.toUpperCase()}
            </a>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Conversazioni
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">Cronologia chat</h2>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const newConversationId = await createConversation();
                  setActiveConversationId(newConversationId);
                  setMessages([]);
                  setMessage("Nuova conversazione pronta.");
                } catch (error) {
                  setErrorMessage(
                    error instanceof Error ? error.message : "Impossibile creare la conversazione.",
                  );
                }
              }}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
              Nuova
            </button>
          </div>
          <div className="mt-4 grid gap-2">
            {conversations.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                Nessuna conversazione ancora avviata. Usa una quick action per iniziare dal primo consiglio.
              </div>
            ) : (
              conversations.map((conversation) => {
                const active = conversation.id === activeConversationId;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => void loadConversation(conversation.id)}
                    className={`rounded-[1.25rem] border px-4 py-3 text-left transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <p className="text-sm font-semibold">{conversation.title}</p>
                    <p className={`mt-1 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                      {formatDateTime(conversation.updated_at)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                <DashboardIcon name="spark" className="h-4 w-4" />
                AI Business Coach
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                Assistente marketing per la tua attivita
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Fai domande in linguaggio naturale: il Coach legge il tuo Business Profile, i contenuti,
                il CRM, i calendari e il piano attivo per suggerire azioni concrete.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Quick actions</p>
              <p className="mt-2">Analisi business, calendario, contenuti, CRM e campagne 30 giorni.</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => {
                  setInput(action);
                  void handleSend(action);
                }}
                className="min-w-[12rem] rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >
                <p className="text-sm font-semibold text-slate-950">{action}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Chat persistente
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-950">
                    {activeConversation?.title ?? "Nuova conversazione"}
                  </h3>
                </div>
                {isLoadingConversation ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Caricamento...
                  </span>
                ) : null}
              </div>
            </div>

            <div className="max-h-[44rem] space-y-5 overflow-y-auto px-6 py-6">
              {messages.length === 0 && !isSending ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <DashboardIcon name="message" className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-slate-950">
                    Inizia dal primo consiglio del Coach
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Chiedi una promo per il weekend, un’analisi del calendario o un piano per recuperare clienti inattivi.
                  </p>
                </div>
              ) : null}

              {messages.map((item) => {
                const isAssistant = item.role === "assistant";
                return (
                  <div
                    key={item.id}
                    className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-3xl rounded-[1.75rem] px-5 py-4 ${
                        isAssistant
                          ? "border border-slate-200 bg-slate-50 text-slate-900"
                          : "bg-slate-950 text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p
                          className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                            isAssistant ? "text-slate-500" : "text-slate-300"
                          }`}
                        >
                          {isAssistant ? "BizKit Coach" : "Tu"}
                        </p>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs ${
                              isAssistant ? "text-slate-500" : "text-slate-300"
                            }`}
                          >
                            {formatDateTime(item.created_at)}
                          </span>
                          {isAssistant ? (
                            <button
                              type="button"
                              onClick={() => void handleCopyResponse(item.content)}
                              className="inline-flex text-xs font-semibold text-blue-600"
                            >
                              Copia
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3">
                        {isAssistant ? (
                          <SimpleMarkdown content={item.content} className="space-y-4" />
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-7">{item.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isSending ? (
                <div className="flex justify-start">
                  <div className="max-w-xl rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 text-slate-700">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      BizKit Coach
                    </p>
                    <div className="mt-4 flex gap-2">
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400" />
                    </div>
                  </div>
                </div>
              ) : null}
              <div ref={endRef} />
            </div>

            <div className="border-t border-slate-200 px-6 py-5">
              <div className="grid gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={4}
                  placeholder="Chiedi al Coach come ottenere piu prenotazioni, quali contenuti ti mancano o che campagna lanciare questo mese."
                  className="rounded-[1.5rem] border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                  disabled={isSending}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Il Coach usa Business Profile, CRM, contenuti, calendari e piano attivo del tuo account.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={isSending || !input.trim()}
                    className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSending ? "Coach al lavoro..." : "Invia al Coach"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Consigli del Coach
              </p>
              <div className="mt-4 grid gap-3">
                {coachSuggestions.map((tip) => (
                  <button
                    key={tip.id}
                    type="button"
                    onClick={() => {
                      setInput(tip.quickPrompt);
                      void handleSend(tip.quickPrompt);
                    }}
                    className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                      tip.severity === "warning"
                        ? "border-amber-200 bg-amber-50 hover:border-amber-300"
                        : tip.severity === "success"
                          ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
                          : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-950">{tip.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{tip.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
