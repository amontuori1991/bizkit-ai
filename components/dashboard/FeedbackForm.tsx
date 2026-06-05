"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_PRIORITIES,
  formatFeedbackCategory,
  formatFeedbackPriority,
  type FeedbackCategory,
  type FeedbackItem,
  type FeedbackPriority,
} from "@/lib/feedback";

type FeedbackFormProps = {
  compact?: boolean;
  submitLabel?: string;
  onCreated?: (feedback: FeedbackItem) => void;
};

export function FeedbackForm({
  compact = false,
  submitLabel = "Invia feedback",
  onCreated,
}: FeedbackFormProps) {
  const pathname = usePathname();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("improvement");
  const [priority, setPriority] = useState<FeedbackPriority>("medium");
  const [attachPage, setAttachPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const browserInfo = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const navigatorWithUserAgentData = window.navigator as Navigator & {
      userAgentData?: {
        platform?: string;
      };
    };
    const platform = navigatorWithUserAgentData.userAgentData?.platform ?? window.navigator.platform ?? "";
    return [window.navigator.userAgent, platform].filter(Boolean).join(" | ");
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          pageUrl: attachPage ? pathname : null,
          browserInfo,
        }),
      });

      const data = (await response.json()) as {
        feedback?: FeedbackItem;
        error?: string;
      };

      if (!response.ok || !data.feedback) {
        throw new Error(data.error ?? "Invio feedback non riuscito.");
      }

      setTitle("");
      setDescription("");
      setCategory("improvement");
      setPriority("medium");
      setSuccessMessage("Grazie! Il tuo feedback è stato registrato.");
      onCreated?.(data.feedback);
      window.dispatchEvent(new CustomEvent("bizkit:feedback-created", { detail: data.feedback }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante l'invio del feedback.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Titolo
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Segnala il punto principale in una riga"
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Descrizione
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={compact ? 4 : 6}
          placeholder="Descrivi cosa hai notato, cosa ti aspettavi e come dovrebbe migliorare."
          className="rounded-[1.5rem] border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          required
        />
      </label>

      <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Categoria
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          >
            {FEEDBACK_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {formatFeedbackCategory(item)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Priorita
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as FeedbackPriority)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          >
            {FEEDBACK_PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {formatFeedbackPriority(item)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="inline-flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={attachPage}
          onChange={(event) => setAttachPage(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        Allega automaticamente la pagina in cui mi trovo
      </label>

      {attachPage ? (
        <p className="text-xs leading-6 text-slate-500">
          Pagina allegata: <span className="font-semibold text-slate-700">{pathname}</span>
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {successMessage ? (
            <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
          ) : null}
          {errorMessage ? <p className="text-sm font-medium text-red-700">{errorMessage}</p> : null}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Invio..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
