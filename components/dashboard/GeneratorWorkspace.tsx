"use client";

import { useState } from "react";
import { DashboardIcon } from "@/components/dashboard/DashboardIcon";
import type { OutputVariant, OutputVariantId } from "@/lib/ai-output";

type GeneratorType = "caption" | "reel" | "promo";

type QuickTemplate = {
  label: string;
  prompt: string;
};

type GeneratorWorkspaceProps = {
  type: GeneratorType;
  title: string;
  helper: string;
  placeholder: string;
  enabled?: boolean;
  disabledMessage?: string;
  profileReady?: boolean;
  endpoint?: string;
  allowSave?: boolean;
  onboardingTitle?: string;
  onboardingSteps?: string[];
  quickTemplates?: QuickTemplate[];
};

type GenerateResponse = {
  result?: string;
  variants?: OutputVariant[];
  generationId?: string;
  error?: string;
  usage?: {
    planId: string;
    usedToday: number;
    dailyLimit: number;
    remainingToday: number;
    totalTokens?: number;
  };
  retryAfterSeconds?: number | null;
};

const defaultTemplates: Record<GeneratorType, QuickTemplate[]> = {
  caption: [
    { label: "Promo estate", prompt: "Scrivi una caption per lanciare una promo estate con iscrizione agevolata entro domenica." },
    { label: "Open day", prompt: "Scrivi una caption per promuovere un open day con consulenza gratuita e visita guidata." },
    { label: "Trasformazione cliente", prompt: "Scrivi una caption che racconti la trasformazione di un cliente in modo credibile e motivante." },
    { label: "Prova gratuita", prompt: "Scrivi una caption per promuovere una prova gratuita di 7 giorni con CTA a DM o WhatsApp." },
    { label: "Recupero inattivi", prompt: "Scrivi una caption per riattivare clienti inattivi con una promo rientro limitata." },
  ],
  reel: [
    { label: "Promo estate", prompt: "Crea un Reel per annunciare una promo estate e spingere DM immediati." },
    { label: "Open day", prompt: "Crea un Reel per invitare le persone a un open day con visita e prova guidata." },
    { label: "Trasformazione cliente", prompt: "Crea un Reel storytelling su una trasformazione cliente prima/dopo." },
    { label: "Prova gratuita", prompt: "Crea un Reel per promuovere la prova gratuita di 7 giorni." },
    { label: "Recupero inattivi", prompt: "Crea un Reel per riportare in palestra clienti inattivi con una proposta semplice." },
  ],
  promo: [
    { label: "Promo estate", prompt: "Crea una promo estate per nuovi iscritti con urgenza chiara e valore percepito alto." },
    { label: "Open day", prompt: "Crea una promo open day con bonus iscrizione valido solo in giornata." },
    { label: "Trasformazione cliente", prompt: "Crea una promo che usi il risultato di un cliente come leva di conversione." },
    { label: "Prova gratuita", prompt: "Crea una promo commerciale per una prova gratuita di 7 giorni." },
    { label: "Recupero inattivi", prompt: "Crea una promo win-back per clienti inattivi con messaggio caldo e deciso." },
  ],
};

const outputLabels: Record<OutputVariantId, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
};

function getDefaultVariant(input: GeneratorType): OutputVariantId {
  if (input === "reel") {
    return "medium";
  }

  return "short";
}

export function GeneratorWorkspace({
  type,
  title,
  helper,
  placeholder,
  enabled = true,
  disabledMessage,
  profileReady = false,
  endpoint = "/api/ai/generate",
  allowSave = true,
  onboardingTitle = "Da dove iniziare",
  onboardingSteps = [
    "Compila o aggiorna il Business Profile per rendere l'AI piu precisa.",
    "Scegli un template rapido o scrivi una richiesta operativa breve.",
    "Genera 3 varianti, copia la migliore e salva quella che vuoi riutilizzare.",
  ],
  quickTemplates,
}: GeneratorWorkspaceProps) {
  const [input, setInput] = useState("");
  const [rawResult, setRawResult] = useState("");
  const [variants, setVariants] = useState<OutputVariant[]>([]);
  const [activeVariantId, setActiveVariantId] = useState<OutputVariantId>(getDefaultVariant(type));
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const templates = quickTemplates ?? defaultTemplates[type];
  const activeVariant =
    variants.find((item) => item.id === activeVariantId) ?? variants[0] ?? null;

  async function handleGenerate(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();

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
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, prompt: input }),
      });

      const data = (await response.json()) as GenerateResponse;
      if (!response.ok || !data.result) {
        throw new Error(data.error ?? "Generazione non riuscita.");
      }

      setRawResult(data.result);
      setVariants(data.variants ?? []);
      setActiveVariantId((data.variants?.[0]?.id as OutputVariantId | undefined) ?? getDefaultVariant(type));
      setGenerationId(data.generationId ?? null);
      setIsSaved(false);
      setSaveTitle("");
      if (data.usage) {
        setMessage(
          `Generazione completata. Piano ${data.usage.planId}: ${data.usage.usedToday}/${data.usage.dailyLimit} usi oggi. Rimangono ${data.usage.remainingToday}.`,
        );
      } else if (endpoint.includes("/demo")) {
        setMessage("Demo completata. Hai sbloccato le 3 varianti gratuite di questo prompt.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante la generazione.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!activeVariant?.content || !allowSave) {
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
          title: saveTitle || `${title} - ${outputLabels[activeVariant.id]}`,
          content: activeVariant.content,
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

  async function handleCopy() {
    if (!activeVariant?.content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activeVariant.content);
      setMessage(`Versione ${activeVariant.label} copiata negli appunti.`);
    } catch {
      setErrorMessage("Impossibile copiare il contenuto negli appunti.");
    }
  }

  function handleDuplicate() {
    if (!activeVariant?.content) {
      return;
    }

    setInput(activeVariant.content);
    setMessage("Versione duplicata nel prompt per una nuova iterazione.");
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,0.95fr)_minmax(30rem,1.05fr)]">
      <div className="space-y-6 min-w-0">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-600/10 via-cyan-400/10 to-transparent" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                <DashboardIcon name="spark" className="h-4 w-4" />
                AI Composer
              </span>
              {profileReady ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <DashboardIcon name="check" className="h-4 w-4" />
                  Business Profile attivo
                </span>
              ) : null}
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">{helper}</p>
            {!profileReady ? (
              <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
                Il Business Profile non e ancora completo. Puoi generare comunque, ma per risultati piu
                coerenti conviene compilare prima nome attivita, citta, tone of voice e target.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Quick templates</p>
              <h3 className="mt-2 text-xl font-bold text-slate-950">Avvia da un caso reale</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              5 prompt pronti
            </span>
          </div>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {templates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => setInput(template.prompt)}
                className="min-w-[12rem] rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >
                <p className="text-sm font-semibold text-slate-950">{template.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{template.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{onboardingTitle}</p>
              <h3 className="mt-2 text-xl font-bold text-slate-950">First generation tutorial</h3>
            </div>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              Setup checklist
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {onboardingSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Richiesta operativa
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
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isLoading || !enabled}
              className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {!enabled ? "Generatore non disponibile" : isLoading ? "Generazione in corso..." : "Genera 3 versioni"}
            </button>
            <button
              type="button"
              onClick={() => {
                setInput("");
                setMessage(null);
                setErrorMessage(null);
              }}
              className="button-secondary"
            >
              Svuota prompt
            </button>
          </div>
          {!enabled && disabledMessage ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {disabledMessage}
            </p>
          ) : null}
        </form>
      </div>

      <div className="min-w-0 space-y-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3 text-white">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-300">Output AI premium</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">Tre varianti pronte da usare</h2>
              </div>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                {variants.length > 0 ? `${variants.length} versioni` : "Nessun output"}
              </span>
            </div>

            <div className="mt-6 rounded-[1.75rem] bg-slate-50 p-4 sm:p-5">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 w-32 rounded-full bg-slate-200" />
                  <div className="h-4 w-full rounded-full bg-slate-200" />
                  <div className="h-4 w-11/12 rounded-full bg-slate-200" />
                  <div className="h-4 w-4/5 rounded-full bg-slate-200" />
                  <div className="h-36 rounded-[1.5rem] bg-white" />
                </div>
              ) : variants.length > 0 && activeVariant ? (
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => {
                      const active = variant.id === activeVariant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setActiveVariantId(variant.id)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            active
                              ? "bg-slate-950 text-white"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                          }`}
                        >
                          {variant.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 min-w-0 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-slate-950">{activeVariant.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{activeVariant.description}</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {activeVariant.content.split(/\s+/).filter(Boolean).length} parole
                      </span>
                    </div>
                    <pre className="mt-5 overflow-x-auto whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-700">
                      {activeVariant.content}
                    </pre>
                  </div>
                </div>
              ) : rawResult ? (
                <pre className="overflow-x-auto whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-700">
                  {rawResult}
                </pre>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <DashboardIcon name="spark" className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-slate-950">Nessun contenuto ancora generato</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Scegli un template rapido oppure scrivi una richiesta breve. Qui vedrai subito versioni short, medium e long.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!activeVariant}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <DashboardIcon name="copy" className="h-4 w-4" />
                Copia
              </button>
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={!activeVariant}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <DashboardIcon name="duplicate" className="h-4 w-4" />
                Duplica
              </button>
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={!input.trim() || isLoading || !enabled}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <DashboardIcon name="refresh" className="h-4 w-4" />
                Rigenera
              </button>
              {allowSave ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!activeVariant || isSaving || !enabled || isSaved}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <DashboardIcon name="save" className="h-4 w-4" />
                  {isSaving ? "Salvataggio..." : isSaved ? "Salvato" : "Salva"}
                </button>
              ) : null}
            </div>

            {allowSave ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  value={saveTitle}
                  onChange={(event) => setSaveTitle(event.target.value)}
                  type="text"
                  placeholder="Titolo del contenuto salvato"
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                  disabled={!enabled}
                />
                <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
                  Ogni salvataggio crea un asset riutilizzabile.
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-700">
                La demo gratuita non salva i contenuti. Crea un account per sbloccare libreria, cronologia e CRM.
              </div>
            )}
          </div>
        </div>

        {message ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
