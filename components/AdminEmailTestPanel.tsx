"use client";

import { useState } from "react";

type EmailTestKind = "welcome" | "subscription" | "kit";

const TEST_BUTTONS: Array<{ id: EmailTestKind; label: string; helper: string }> = [
  {
    id: "welcome",
    label: "Welcome test",
    helper: "Invia la welcome email all'indirizzo supporto configurato.",
  },
  {
    id: "subscription",
    label: "Subscription test",
    helper: "Invia la mail attivazione piano con esempio Pro.",
  },
  {
    id: "kit",
    label: "Kit test",
    helper: "Invia la mail acquisto kit con CTA verso l'area download.",
  },
];

export function AdminEmailTestPanel({ enabled }: { enabled: boolean }) {
  const [loadingKind, setLoadingKind] = useState<EmailTestKind | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(kind: EmailTestKind) {
    setLoadingKind(kind);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/email-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kind }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Invio test email non riuscito.");
      }

      setMessage(payload?.message ?? "Email test inviata correttamente.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Errore durante l'invio della test email.",
      );
    } finally {
      setLoadingKind(null);
    }
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Email test
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Verifica i template Resend
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            I bottoni qui sotto inviano le tre email transazionali principali all&apos;indirizzo
            admin configurato nelle site settings.
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
            enabled
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {enabled ? "Pronto" : "Disattivato"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {TEST_BUTTONS.map((item) => (
          <div
            key={item.id}
            className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
          >
            <p className="font-semibold text-slate-950">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.helper}</p>
            <button
              type="button"
              disabled={!enabled || Boolean(loadingKind)}
              onClick={() => handleSend(item.id)}
              className="button-secondary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingKind === item.id ? "Invio in corso..." : "Invia test"}
            </button>
          </div>
        ))}
      </div>

      {message ? (
        <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mt-5 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
