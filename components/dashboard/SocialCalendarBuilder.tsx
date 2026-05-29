"use client";

import { useCallback, useState } from "react";
import { DashboardIcon } from "@/components/dashboard/DashboardIcon";
import { FloatingFeedback } from "@/components/ui/FloatingFeedback";
import { trackEvent } from "@/lib/analytics";
import type { BusinessProfile } from "@/lib/business-profile";
import {
  buildFullContentPrompt,
  getGenerationTypeFromFormat,
  inferCalendarVertical,
  socialCalendarDayOptions,
  socialCalendarObjectives,
  SOCIAL_CALENDAR_COST,
  type SocialCalendarDays,
  type SocialCalendarEntry,
  type SocialCalendarPayload,
} from "@/lib/social-calendar";

type CalendarResponse = {
  calendar?: SocialCalendarPayload;
  calendarId?: string;
  error?: string;
  usage?: {
    planId: string;
    usedToday: number;
    dailyLimit: number;
    remainingToday: number;
    totalTokens?: number;
    costUnits?: number;
  };
};

type GeneratedRowState = {
  loading?: boolean;
  content?: string;
  generationId?: string | null;
  saved?: boolean;
  error?: string | null;
};

type SocialCalendarBuilderProps = {
  endpoint?: string;
  enabled?: boolean;
  disabledMessage?: string;
  profileReady?: boolean;
  profile: BusinessProfile | null;
  allowSave?: boolean;
  title?: string;
  helper?: string;
  demoMode?: boolean;
};

function formatRowForCopy(entry: SocialCalendarEntry) {
  return [
    `${entry.day}. ${entry.date} - ${entry.title}`,
    `Formato: ${entry.format}`,
    `Caption: ${entry.caption}`,
    `CTA: ${entry.cta}`,
    `Hashtag: ${entry.hashtags}`,
  ].join("\n");
}

export function SocialCalendarBuilder({
  endpoint = "/api/ai/calendar",
  enabled = true,
  disabledMessage,
  profileReady = false,
  profile,
  allowSave = true,
  title = "Social Calendar Generator",
  helper = "Genera un piano contenuti completo usando automaticamente Business Profile, target, servizi, CTA e tone of voice.",
  demoMode = false,
}: SocialCalendarBuilderProps) {
  const [days, setDays] = useState<SocialCalendarDays>(demoMode ? 7 : 14);
  const [objective, setObjective] = useState<string>(socialCalendarObjectives[0]);
  const [calendar, setCalendar] = useState<SocialCalendarPayload | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedRows, setGeneratedRows] = useState<Record<number, GeneratedRowState>>({});

  const vertical = inferCalendarVertical(profile);
  const clearMessage = useCallback(() => setMessage(null), []);
  const clearError = useCallback(() => setErrorMessage(null), []);

  async function handleGenerate(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!enabled) {
      setErrorMessage(
        disabledMessage || "OpenAI non e configurato. Il social calendar e disattivato.",
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      trackEvent("ai_calendar_requested", {
        business_type: profile?.business_type ?? "gym",
        period_days: days,
        objective,
        mode: demoMode ? "demo" : "dashboard",
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days,
          objective,
          businessType: profile?.business_type ?? "gym",
          vertical,
          mode: demoMode ? "calendar" : undefined,
        }),
      });

      const data = (await response.json()) as CalendarResponse;
      if (!response.ok || !data.calendar) {
        throw new Error(data.error ?? "Generazione calendario non riuscita.");
      }

      setCalendar(data.calendar);
      setCalendarId(data.calendarId ?? null);
      setGeneratedRows({});

      trackEvent("ai_calendar_completed", {
        business_type: profile?.business_type ?? "gym",
        period_days: days,
        objective,
        row_count: data.calendar.entries.length,
        mode: demoMode ? "demo" : "dashboard",
      });

      if (data.usage) {
        setMessage(
          `Calendario pronto. Costo: ${data.usage.costUnits ?? SOCIAL_CALENDAR_COST} crediti AI. Oggi hai usato ${data.usage.usedToday}/${data.usage.dailyLimit} crediti.`,
        );
      } else if (demoMode) {
        setMessage("Mini calendario demo generato correttamente.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Errore durante la generazione del calendario.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy(entry: SocialCalendarEntry) {
    try {
      await navigator.clipboard.writeText(formatRowForCopy(entry));
      setMessage(`Giorno ${entry.day} copiato negli appunti.`);
      trackEvent("ai_feature_used", {
        feature_name: "copy_calendar_row",
        business_type: profile?.business_type ?? "gym",
        period_days: calendar?.periodDays ?? days,
      });
    } catch {
      setErrorMessage("Impossibile copiare la riga del calendario.");
    }
  }

  async function handleSave(entry: SocialCalendarEntry) {
    if (!allowSave) {
      return;
    }

    try {
      const response = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "social_calendar_entry",
          title: `${calendar?.title ?? "Calendario"} - Giorno ${entry.day} - ${entry.title}`,
          content: formatRowForCopy(entry),
        }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Salvataggio non riuscito.");
      }

      setMessage(`Giorno ${entry.day} salvato nella libreria.`);
      trackEvent("ai_feature_used", {
        feature_name: "save_calendar_row",
        business_type: profile?.business_type ?? "gym",
        period_days: calendar?.periodDays ?? days,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante il salvataggio.");
    }
  }

  async function handleGenerateFullContent(entry: SocialCalendarEntry) {
    const rowKey = entry.day;

    setGeneratedRows((current) => ({
      ...current,
      [rowKey]: { ...current[rowKey], loading: true, error: null },
    }));
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: getGenerationTypeFromFormat(vertical, entry.format),
          prompt: buildFullContentPrompt(entry, profile),
          businessType: profile?.business_type ?? "gym",
          templateLabel: `calendar:${entry.pillar}`,
        }),
      });

      const data = (await response.json()) as {
        result?: string;
        generationId?: string;
        error?: string;
      };

      if (!response.ok || !data.result) {
        throw new Error(data.error ?? "Generazione contenuto non riuscita.");
      }

      setGeneratedRows((current) => ({
        ...current,
        [rowKey]: {
          loading: false,
          content: data.result,
          generationId: data.generationId ?? null,
          saved: false,
          error: null,
        },
      }));
      setMessage(`Contenuto completo generato per il giorno ${entry.day}.`);
      trackEvent("ai_feature_used", {
        feature_name: "generate_calendar_row_content",
        business_type: profile?.business_type ?? "gym",
        generation_type: getGenerationTypeFromFormat(vertical, entry.format),
        row_format: entry.format,
      });
    } catch (error) {
      setGeneratedRows((current) => ({
        ...current,
        [rowKey]: {
          ...current[rowKey],
          loading: false,
          error: error instanceof Error ? error.message : "Errore durante la generazione.",
        },
      }));
    }
  }

  async function handleSaveGeneratedRow(entry: SocialCalendarEntry) {
    const rowState = generatedRows[entry.day];
    if (!rowState?.content) {
      return;
    }

    try {
      const response = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: getGenerationTypeFromFormat(vertical, entry.format),
          title: `${entry.title} - versione completa`,
          content: rowState.content,
          generationId: rowState.generationId ?? null,
        }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Salvataggio non riuscito.");
      }

      setGeneratedRows((current) => ({
        ...current,
        [entry.day]: { ...current[entry.day], saved: true },
      }));
      setMessage(`Contenuto completo del giorno ${entry.day} salvato.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante il salvataggio.");
    }
  }

  function renderRow(entry: SocialCalendarEntry) {
    const rowState = generatedRows[entry.day];

    return (
      <div key={`${entry.day}-${entry.date}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                Giorno {entry.day}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {entry.format}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {entry.date}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-950">{entry.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{entry.caption}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleGenerateFullContent(entry)}
              disabled={rowState?.loading}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {rowState?.loading ? "Genero..." : "Genera contenuto completo"}
            </button>
            <button
              type="button"
              onClick={() => void handleSave(entry)}
              disabled={!allowSave}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
            >
              Salva
            </button>
            <button
              type="button"
              onClick={() => void handleCopy(entry)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              Copia
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pillar</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{entry.pillar}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">CTA</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{entry.cta}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Hashtag</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{entry.hashtags}</p>
          </div>
        </div>

        {rowState?.content ? (
          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                Contenuto completo
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(rowState.content ?? "")}
                  className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Copia output
                </button>
                {allowSave ? (
                  <button
                    type="button"
                    onClick={() => void handleSaveGeneratedRow(entry)}
                    disabled={rowState.saved}
                    className="rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {rowState.saved ? "Salvato" : "Salva output"}
                  </button>
                ) : null}
              </div>
            </div>
            <pre className="mt-4 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-700">
              {rowState.content}
            </pre>
          </div>
        ) : null}

        {rowState?.error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {rowState.error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FloatingFeedback type="success" message={message} onClose={clearMessage} />
      <FloatingFeedback type="error" message={errorMessage} onClose={clearError} />
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            <DashboardIcon name="calendar" className="h-4 w-4" />
            Planner AI
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            1 calendario = {SOCIAL_CALENDAR_COST} crediti AI
          </span>
        </div>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">{helper}</p>
        {!profileReady && !demoMode ? (
          <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
            Il Business Profile non e ancora completo. Il calendario usera il contesto disponibile,
            ma diventa molto piu preciso dopo aver compilato citta, servizi, target e CTA.
          </div>
        ) : null}
      </div>

      <form onSubmit={handleGenerate} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[0.25fr_0.75fr]">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Numero giorni
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value) as SocialCalendarDays)}
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              disabled={demoMode}
            >
              {socialCalendarDayOptions
                .filter((item) => (demoMode ? item === 7 : true))
                .map((item) => (
                  <option key={item} value={item}>
                    {item} giorni
                  </option>
                ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Obiettivo del calendario
            <input
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              list="social-calendar-objectives"
              placeholder="Es: Riempire l'agenda della prossima settimana"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            />
            <datalist id="social-calendar-objectives">
              {socialCalendarObjectives.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isLoading || !enabled}
            className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {!enabled
              ? "Planner non disponibile"
              : isLoading
                ? "Calendario in generazione..."
                : demoMode
                  ? "Genera mini calendario 7 giorni"
                  : "Genera calendario"}
          </button>
          <button
            type="button"
            onClick={() => {
              setCalendar(null);
              setCalendarId(null);
              setGeneratedRows({});
              setMessage(null);
              setErrorMessage(null);
            }}
            className="button-secondary"
          >
            Pulisci
          </button>
        </div>
        {!enabled && disabledMessage ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {disabledMessage}
          </p>
        ) : null}
      </form>

      {calendar ? (
        <div className="space-y-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Calendario pronto
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">{calendar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{calendar.objective}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Periodo</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{calendar.periodDays} giorni</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Verticale</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {vertical === "hair" ? "Hair & Beauty" : "Fitness"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Righe</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{calendar.entries.length}</p>
                </div>
              </div>
            </div>
            {calendarId ? (
              <p className="mt-4 text-xs text-slate-500">Calendario salvato con ID {calendarId}</p>
            ) : null}
          </div>

          <div className="grid gap-4 xl:hidden">
            {calendar.entries.map((entry) => renderRow(entry))}
          </div>

          <div className="hidden overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft xl:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-4 font-semibold">Giorno</th>
                    <th className="px-4 py-4 font-semibold">Data</th>
                    <th className="px-4 py-4 font-semibold">Titolo</th>
                    <th className="px-4 py-4 font-semibold">Formato</th>
                    <th className="px-4 py-4 font-semibold">Caption</th>
                    <th className="px-4 py-4 font-semibold">CTA</th>
                    <th className="px-4 py-4 font-semibold">Hashtag</th>
                    <th className="px-4 py-4 font-semibold">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {calendar.entries.map((entry) => (
                    <tr key={`${entry.day}-${entry.date}`} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-4 font-semibold text-slate-950">{entry.day}</td>
                      <td className="px-4 py-4 text-slate-600">{entry.date}</td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-950">{entry.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {entry.pillar}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{entry.format}</td>
                      <td className="px-4 py-4 text-slate-600">{entry.caption}</td>
                      <td className="px-4 py-4 text-slate-600">{entry.cta}</td>
                      <td className="px-4 py-4 text-slate-600">{entry.hashtags}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => void handleGenerateFullContent(entry)}
                            className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Genera contenuto completo
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleSave(entry)}
                            disabled={!allowSave}
                            className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
                          >
                            Salva
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleCopy(entry)}
                            className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            Copia
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4">
            {calendar.entries
              .filter((entry) => generatedRows[entry.day]?.content || generatedRows[entry.day]?.error || generatedRows[entry.day]?.loading)
              .map((entry) => renderRow(entry))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
