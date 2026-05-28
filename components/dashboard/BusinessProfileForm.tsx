"use client";

import { useState } from "react";
import type { BusinessProfile } from "@/lib/business-profile";

type BusinessProfileFormProps = {
  initialProfile: BusinessProfile | null;
};

type FormState = {
  business_name: string;
  business_type: string;
  city: string;
  address: string;
  website: string;
  instagram: string;
  tone_of_voice: string;
  target_audience: string;
  services: string;
  unique_selling_points: string;
  preferred_cta: string;
  preferred_hashtags: string;
};

function getInitialForm(profile: BusinessProfile | null): FormState {
  return {
    business_name: profile?.business_name ?? "",
    business_type: profile?.business_type ?? "",
    city: profile?.city ?? "",
    address: profile?.address ?? "",
    website: profile?.website ?? "",
    instagram: profile?.instagram ?? "",
    tone_of_voice: profile?.tone_of_voice ?? "",
    target_audience: profile?.target_audience ?? "",
    services: profile?.services ?? "",
    unique_selling_points: profile?.unique_selling_points ?? "",
    preferred_cta: profile?.preferred_cta ?? "",
    preferred_hashtags: profile?.preferred_hashtags ?? "",
  };
}

export function BusinessProfileForm({ initialProfile }: BusinessProfileFormProps) {
  const [form, setForm] = useState<FormState>(getInitialForm(initialProfile));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/business-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Salvataggio non riuscito.");
      }

      setMessage("Profilo business aggiornato. Le prossime generazioni useranno automaticamente questo contesto.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {[
          ["business_name", "Nome attivita", "Palestra Energia"],
          ["business_type", "Tipo di business", "Palestra boutique"],
          ["city", "Citta", "Milano"],
          ["address", "Indirizzo", "Via Roma 10"],
          ["website", "Sito web", "https://www.tuodominio.it"],
          ["instagram", "Instagram", "@palestraenergia"],
          ["tone_of_voice", "Tone of voice", "Professionale, energico, accogliente"],
          ["target_audience", "Target audience", "Uomini e donne 28-45 che vogliono rimettersi in forma"],
          ["preferred_cta", "CTA preferita", "Prenota la tua prova gratuita"],
          ["preferred_hashtags", "Hashtag preferiti", "#palestramilano #fitnessmilano #wellness"],
        ].map(([key, label, placeholder]) => (
          <label key={key} className="grid gap-2 text-sm font-medium text-slate-700">
            {label}
            <input
              value={form[key as keyof FormState]}
              onChange={(event) =>
                setForm((current) => ({ ...current, [key]: event.target.value }))
              }
              type="text"
              placeholder={placeholder}
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </label>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Servizi
          <textarea
            value={form.services}
            onChange={(event) => setForm((current) => ({ ...current, services: event.target.value }))}
            rows={5}
            placeholder="Sala pesi, personal training, corsi small group, programmi dimagrimento"
            className="rounded-[1.5rem] border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Unique selling points
          <textarea
            value={form.unique_selling_points}
            onChange={(event) =>
              setForm((current) => ({ ...current, unique_selling_points: event.target.value }))
            }
            rows={5}
            placeholder="Allenamenti su misura, ambiente non intimidatorio, coach dedicati"
            className="rounded-[1.5rem] border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
        </label>
      </div>

      <div className="rounded-[1.75rem] border border-blue-200 bg-blue-50 p-5 text-sm leading-7 text-slate-700">
        Una volta compilato questo profilo, i generatori AI useranno automaticamente nome attivita,
        citta, tono di voce, target, servizi, punti di forza, CTA e hashtag. Nei generatori dovrai
        scrivere solo la richiesta operativa breve.
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSaving}
          className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Salvataggio..." : "Salva profilo business"}
        </button>
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
    </form>
  );
}
