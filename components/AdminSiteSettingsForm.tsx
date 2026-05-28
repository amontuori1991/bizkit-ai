"use client";

import { useState } from "react";
import type { SiteSettings, SiteSettingsStorageMode } from "@/lib/site-settings";

type AdminSiteSettingsFormProps = {
  initialSettings: SiteSettings;
  storageMode?: SiteSettingsStorageMode;
};

export function AdminSiteSettingsForm({
  initialSettings,
  storageMode = "local",
}: AdminSiteSettingsFormProps) {
  const [form, setForm] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        settings?: SiteSettings;
      };

      if (!response.ok || !data.success || !data.settings) {
        throw new Error(data.error ?? "Impossibile salvare le impostazioni.");
      }

      setForm(data.settings);
      setMessage("Contatti aggiornati con successo.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email contatti
          <input
            type="email"
            value={form.contactEmail}
            onChange={(event) =>
              setForm((current) => ({ ...current, contactEmail: event.target.value }))
            }
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email supporto
          <input
            type="email"
            value={form.supportEmail}
            onChange={(event) =>
              setForm((current) => ({ ...current, supportEmail: event.target.value }))
            }
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Instagram
          <input
            type="text"
            value={form.instagramHandle}
            onChange={(event) =>
              setForm((current) => ({ ...current, instagramHandle: event.target.value }))
            }
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Disponibilita
          <input
            type="text"
            value={form.businessAvailability}
            onChange={(event) =>
              setForm((current) => ({ ...current, businessAvailability: event.target.value }))
            }
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
      >
        {isSaving ? "Salvataggio..." : "Salva contatti sito"}
      </button>

      <p className="text-sm leading-6 text-slate-500">
        {storageMode === "supabase"
          ? "Le impostazioni vengono salvate su Supabase e sono modificabili anche in produzione."
          : storageMode === "local"
            ? "Le impostazioni vengono salvate in un file JSON locale. Ottimo per sviluppo e test rapidi."
            : "Lo storage attuale e in sola lettura. Configura Supabase service role per rendere queste impostazioni modificabili in produzione."}
      </p>

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
    </form>
  );
}
