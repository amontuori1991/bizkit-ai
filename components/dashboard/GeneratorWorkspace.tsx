"use client";

import { useState } from "react";

type GeneratorType = "caption" | "reel" | "promo";

type GeneratorWorkspaceProps = {
  type: GeneratorType;
  title: string;
  helper: string;
  placeholder: string;
  enabled?: boolean;
  disabledMessage?: string;
  profileReady?: boolean;
};

type GenerateResponse = {
  result?: string;
  generationId?: string;
  error?: string;
};

export function GeneratorWorkspace({
  type,
  title,
  helper,
  placeholder,
  enabled = true,
  disabledMessage,
  profileReady = false,
}: GeneratorWorkspaceProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled) {
      setErrorMessage(
        disabledMessage || "OpenAI non e configurato. I generatori AI sono disattivati.",
      );
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, prompt: input }),
      });

      const data = (await response.json()) as GenerateResponse;
      if (!response.ok || !data.result) {
        throw new Error(data.error ?? "Generazione non riuscita.");
      }

      setResult(data.result);
      setGenerationId(data.generationId ?? null);
      setIsSaved(false);
      setSaveTitle("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante la generazione.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!result) {
      return;
    }

    if (!enabled) {
      setErrorMessage(
        disabledMessage || "OpenAI non e configurato. Il salvataggio AI e disattivato.",
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: saveTitle || title,
          content: result,
          generationId,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        success?: boolean;
        alreadySaved?: boolean;
      };
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Salvataggio non riuscito.");
      }

      setIsSaved(true);
      setMessage(data.alreadySaved ? "Contenuto gia presente in libreria." : "Contenuto salvato nella libreria.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
        <p className="mt-3 leading-7 text-slate-600">{helper}</p>
        {!profileReady ? (
          <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
            Il Business Profile non e ancora completo. Puoi generare comunque, ma per risultati piu
            coerenti conviene compilare prima nome attivita, citta, tone of voice e target.
          </div>
        ) : null}
        <form onSubmit={handleGenerate} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Prompt operativo
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={8}
              placeholder={placeholder}
              className="rounded-[1.5rem] border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
              disabled={!enabled}
            />
          </label>
          <button
            type="submit"
            disabled={isLoading || !enabled}
            className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {!enabled ? "Generatore non disponibile" : isLoading ? "Generazione in corso..." : "Genera contenuto"}
          </button>
          {!enabled && disabledMessage ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {disabledMessage}
            </p>
          ) : null}
        </form>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-950">Output AI</h2>
        <p className="mt-3 leading-7 text-slate-600">
          Ogni generazione viene salvata automaticamente nella cronologia. Se vuoi, puoi salvarla anche come contenuto riutilizzabile.
        </p>
        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          {result ? (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {result}
            </pre>
          ) : (
            <p className="text-sm text-slate-500">Qui comparira il contenuto generato.</p>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={saveTitle}
            onChange={(event) => setSaveTitle(event.target.value)}
            type="text"
            placeholder="Titolo del contenuto salvato"
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            disabled={!enabled}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!result || isSaving || !enabled || isSaved}
            className="button-secondary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Salvataggio..." : isSaved ? "Salvato" : "Salva contenuto"}
          </button>
        </div>
        {message ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
