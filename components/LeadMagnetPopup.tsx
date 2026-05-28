"use client";

import { useEffect, useState } from "react";
import { trackLeadSignup } from "@/lib/analytics";

type LeadResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
};

const STORAGE_KEY = "bizkit-ai-lead-popup-dismissed";

export function LeadMagnetPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = window.setTimeout(() => setOpen(true), 1400);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, []);

  function closePopup() {
    setOpen(false);
    window.localStorage.setItem(STORAGE_KEY, "true");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "lead-popup",
        }),
      });

      const data = (await response.json()) as LeadResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Impossibile registrare il lead in questo momento.");
      }

      setSuccessMessage(data.message ?? "Controlla la tua email");
      trackLeadSignup({
        source: "lead-popup",
        asset: "10-prompt-ai-gratis-per-palestre",
      });
      window.localStorage.setItem(STORAGE_KEY, "true");

      if (data.redirectTo) {
        window.setTimeout(() => {
          window.location.href = data.redirectTo as string;
        }, 900);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Si e verificato un errore durante la richiesta.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-2xl shadow-slate-900/20">
        <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_rgba(255,255,255,0.98)_42%,_rgba(15,23,42,0.04)_100%)]" />
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-4 top-4 z-10 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-500"
        >
          Chiudi
        </button>
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              Lead Magnet
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              Freebie
            </span>
          </div>
          <h2 className="mt-5 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            10 Prompt AI Gratis per Palestre
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Lascia la tua email e ricevi subito una mini raccolta gratuita per creare contenuti,
            offerte e messaggi piu velocemente.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["10 prompt pronti", "PDF immediato", "Preview del kit premium"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {item}
              </span>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nome@email.it"
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                required
              />
            </label>
            <div className="self-end">
              <button
                type="submit"
                disabled={isLoading}
                className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-40"
              >
                {isLoading ? "Invio..." : "Scarica gratis"}
              </button>
            </div>
          </form>
          {errorMessage ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Integrazioni future gia previste: Resend, Mailchimp e ConvertKit.
          </p>
        </div>
      </div>
    </div>
  );
}
