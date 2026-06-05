"use client";

import { useEffect, useMemo, useState } from "react";
import { FeedbackForm } from "@/components/dashboard/FeedbackForm";
import {
  formatFeedbackCategory,
  formatFeedbackStatus,
  getFeedbackCategoryBadgeClass,
  getFeedbackPriorityBadgeClass,
  getFeedbackStatusBadgeClass,
  type FeedbackItem,
  type FeedbackStatusEvent,
} from "@/lib/feedback";

type FeedbackWorkspaceProps = {
  initialFeedback: FeedbackItem[];
  initialStatusEvents: FeedbackStatusEvent[];
};

type FeedbackListResponse = {
  feedback?: FeedbackItem[];
  statusEvents?: FeedbackStatusEvent[];
  error?: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeedbackWorkspace({ initialFeedback, initialStatusEvents }: FeedbackWorkspaceProps) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [statusEvents, setStatusEvents] = useState(initialStatusEvents);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refreshFeedback() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json()) as FeedbackListResponse;
      if (response.ok && data.feedback) {
        setFeedback(data.feedback);
        setStatusEvents(data.statusEvents ?? []);
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshFeedback();
    }, 30000);

    function handleCreated(event: Event) {
      const customEvent = event as CustomEvent<FeedbackItem>;
      if (customEvent.detail) {
        setFeedback((current) =>
          current.some((item) => item.id === customEvent.detail.id)
            ? current
            : [customEvent.detail, ...current],
        );
      } else {
        void refreshFeedback();
      }
    }

    window.addEventListener("bizkit:feedback-created", handleCreated);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("bizkit:feedback-created", handleCreated);
    };
  }, []);

  const openItems = useMemo(
    () => feedback.filter((item) => item.status === "open" || item.status === "under_review").length,
    [feedback],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Beta feedback
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Invia un feedback utile al team</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Segnala bug, miglioramenti, richieste feature o problemi di usabilita. Il feedback
              entra nella roadmap e ti permette di vedere lo stato di lavorazione.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">{feedback.length} feedback inviati</p>
            <p className="mt-2">{openItems} ancora aperti o in revisione.</p>
          </div>
        </div>

        <div className="mt-6">
          <FeedbackForm
            onCreated={(item) => {
              setFeedback((current) => [item, ...current]);
            }}
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              I miei feedback
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Storico feedback</h2>
          </div>
          <button
            type="button"
            onClick={() => void refreshFeedback()}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            {isRefreshing ? "Aggiorno..." : "Aggiorna"}
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {feedback.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
              Nessun feedback ancora inviato. Usa il form qui sopra oppure il pulsante rapido in basso a destra.
            </div>
          ) : (
            feedback.map((item) => (
              <article key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {item.ticket_code ? (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.ticket_code}
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getFeedbackCategoryBadgeClass(item.category)}`}
                      >
                        {formatFeedbackCategory(item.category)}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getFeedbackPriorityBadgeClass(item.priority)}`}
                      >
                        Priorita {item.priority}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getFeedbackStatusBadgeClass(item.status)}`}
                      >
                        {formatFeedbackStatus(item.status)}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-950">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500">{formatDate(item.created_at)}</p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                  {item.page_url ? (
                    <span>
                      Pagina: <span className="font-semibold text-slate-700">{item.page_url}</span>
                    </span>
                  ) : null}
                  <span>
                    Aggiornato: <span className="font-semibold text-slate-700">{formatDate(item.updated_at)}</span>
                  </span>
                </div>
                {statusEvents.filter((event) => event.feedback_id === item.id).length > 0 ? (
                  <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Cronologia stato
                    </p>
                    <div className="mt-3 grid gap-3">
                      {statusEvents
                        .filter((event) => event.feedback_id === item.id)
                        .slice(0, 6)
                        .map((event) => (
                          <div key={event.id} className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-semibold text-slate-900">
                                {event.from_status ? `${formatFeedbackStatus(event.from_status)} -> ` : ""}
                                {formatFeedbackStatus(event.to_status)}
                              </p>
                              <span className="text-xs text-slate-500">{formatDate(event.created_at)}</span>
                            </div>
                            {event.note_snapshot ? (
                              <p className="mt-2 whitespace-pre-wrap leading-6 text-slate-600">
                                {event.note_snapshot}
                              </p>
                            ) : null}
                          </div>
                        ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
