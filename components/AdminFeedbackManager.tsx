"use client";

import { useMemo, useState } from "react";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  formatFeedbackCategory,
  formatFeedbackStatus,
  getFeedbackCategoryBadgeClass,
  getFeedbackPriorityBadgeClass,
  getFeedbackStatusBadgeClass,
  type AdminFeedbackItem,
  type FeedbackStatus,
} from "@/lib/feedback";

type AdminFeedbackManagerProps = {
  initialFeedback: AdminFeedbackItem[];
  configured: boolean;
};

type DateFilter = "all" | "7d" | "30d" | "90d";

function formatDate(value: string) {
  return new Date(value).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function withinDateRange(value: string, filter: DateFilter) {
  if (filter === "all") {
    return true;
  }

  const createdAt = new Date(value).getTime();
  const now = Date.now();
  const deltaDays = filter === "7d" ? 7 : filter === "30d" ? 30 : 90;
  return createdAt >= now - deltaDays * 24 * 60 * 60 * 1000;
}

export function AdminFeedbackManager({
  initialFeedback,
  configured,
}: AdminFeedbackManagerProps) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("30d");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredFeedback = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return feedback.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch) ||
        item.userEmail?.toLowerCase().includes(normalizedSearch) ||
        item.page_url?.toLowerCase().includes(normalizedSearch);

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesPlan = planFilter === "all" || item.planId === planFilter;
      const matchesDate = withinDateRange(item.created_at, dateFilter);

      return matchesSearch && matchesCategory && matchesStatus && matchesPlan && matchesDate;
    });
  }, [categoryFilter, dateFilter, feedback, planFilter, search, statusFilter]);

  async function handleSave(item: AdminFeedbackItem) {
    setSavingId(item.id);
    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/feedback/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: item.status,
          adminNotes: item.admin_notes ?? "",
        }),
      });

      const data = (await response.json()) as {
        feedback?: AdminFeedbackItem;
        error?: string;
      };

      if (!response.ok || !data.feedback) {
        throw new Error(data.error ?? "Aggiornamento feedback non riuscito.");
      }

      setFeedback((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, ...data.feedback, userEmail: entry.userEmail, planId: entry.planId } : entry,
        ),
      );
      setMessage(`Feedback "${item.title}" aggiornato.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante il salvataggio.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(item: AdminFeedbackItem) {
    const confirmed = window.confirm(
      `Vuoi davvero eliminare il feedback "${item.title}"? Questa azione e utile solo per spam o test inutili.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/feedback/${item.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Eliminazione feedback non riuscita.");
      }

      setFeedback((current) => current.filter((entry) => entry.id !== item.id));
      setMessage(`Feedback "${item.title}" eliminato.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante l'eliminazione.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Admin Feedback</span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Roadmap guidata dai beta tester
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              Leggi tutti i feedback reali, filtra per categoria, piano o stato e aggiorna la roadmap
              direttamente dall&apos;area admin.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Feedback visibili</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{filteredFeedback.length}</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Configurazione</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{configured ? "OK" : "Manca"}</p>
            </div>
          </div>
        </div>

        {!configured ? (
          <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-700">
            `SUPABASE_SERVICE_ROLE_KEY` non configurata. La pagina non puo leggere o gestire i feedback.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Ricerca testo
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Titolo, descrizione, email o URL pagina"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Categoria
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="all">Tutte</option>
              {FEEDBACK_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {formatFeedbackCategory(item)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Stato
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="all">Tutti</option>
              {FEEDBACK_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {formatFeedbackStatus(item)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Piano
            <select
              value={planFilter}
              onChange={(event) => setPlanFilter(event.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="all">Tutti</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="agency">Agency</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Data
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value as DateFilter)}
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="all">Tutto lo storico</option>
              <option value="7d">Ultimi 7 giorni</option>
              <option value="30d">Ultimi 30 giorni</option>
              <option value="90d">Ultimi 90 giorni</option>
            </select>
          </label>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}
        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            Nessun feedback corrisponde ai filtri attivi.
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <article key={item.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getFeedbackCategoryBadgeClass(item.category)}`}>
                      {formatFeedbackCategory(item.category)}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getFeedbackPriorityBadgeClass(item.priority)}`}>
                      Priorita {item.priority}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getFeedbackStatusBadgeClass(item.status)}`}>
                      {formatFeedbackStatus(item.status)}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.planId.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-slate-950">{item.title}</h2>
                  <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{item.description}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>
                      Utente: <span className="font-semibold text-slate-700">{item.userEmail ?? "N/D"}</span>
                    </span>
                    <span>
                      Creato: <span className="font-semibold text-slate-700">{formatDate(item.created_at)}</span>
                    </span>
                    {item.page_url ? (
                      <span>
                        Pagina: <span className="font-semibold text-slate-700">{item.page_url}</span>
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="w-full max-w-md rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4">
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Stato
                      <select
                        value={item.status}
                        onChange={(event) =>
                          setFeedback((current) =>
                            current.map((entry) =>
                              entry.id === item.id
                                ? { ...entry, status: event.target.value as FeedbackStatus }
                                : entry,
                            ),
                          )
                        }
                        className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                      >
                        {FEEDBACK_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {formatFeedbackStatus(status)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Nota interna admin
                      <textarea
                        value={item.admin_notes ?? ""}
                        onChange={(event) =>
                          setFeedback((current) =>
                            current.map((entry) =>
                              entry.id === item.id
                                ? { ...entry, admin_notes: event.target.value }
                                : entry,
                            ),
                          )
                        }
                        rows={4}
                        placeholder="Roadmap, decisione, contesto tecnico o motivo del rifiuto."
                        className="rounded-[1.5rem] border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                      />
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => void handleSave(item)}
                        disabled={savingId === item.id}
                        className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {savingId === item.id ? "Salvataggio..." : "Salva aggiornamenti"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {deletingId === item.id ? "Eliminazione..." : "Elimina spam"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

