"use client";

import { useMemo, useState } from "react";
import type { BusinessProfile } from "@/lib/business-profile";
import { businessTypeOptions, isHairBusinessType, type BusinessType } from "@/lib/business-verticals";

type BusinessProfileFormProps = {
  initialProfile: BusinessProfile | null;
};

type FormState = {
  business_name: string;
  business_type: BusinessType | "";
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
  salon_specialties: string;
  booking_link: string;
  opening_hours: string;
  stylist_names: string;
  products_used: string;
  salon_style: string;
};

function getInitialForm(profile: BusinessProfile | null): FormState {
  return {
    business_name: profile?.business_name ?? "",
    business_type: (profile?.business_type as BusinessType | null) ?? "",
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
    salon_specialties: profile?.salon_specialties ?? "",
    booking_link: profile?.booking_link ?? "",
    opening_hours: profile?.opening_hours ?? "",
    stylist_names: profile?.stylist_names ?? "",
    products_used: profile?.products_used ?? "",
    salon_style: profile?.salon_style ?? "",
  };
}

export function BusinessProfileForm({ initialProfile }: BusinessProfileFormProps) {
  const [form, setForm] = useState<FormState>(getInitialForm(initialProfile));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isHairProfile = useMemo(() => isHairBusinessType(form.business_type), [form.business_type]);

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

      setMessage(
        "Profilo business aggiornato. Le prossime generazioni useranno automaticamente questo contesto.",
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Nome attivita
          <input
            value={form.business_name}
            onChange={(event) => setForm((current) => ({ ...current, business_name: event.target.value }))}
            type="text"
            placeholder={isHairProfile ? "Atelier Hair Milano" : "Palestra Energia"}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Tipo di business
          <select
            value={form.business_type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                business_type: event.target.value as BusinessType | "",
              }))
            }
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          >
            <option value="">Seleziona un tipo di business</option>
            <optgroup label="Fitness">
              {businessTypeOptions
                .filter((item) => item.vertical === "fitness")
                .map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Hair & Beauty">
              {businessTypeOptions
                .filter((item) => item.vertical === "hair")
                .map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
            </optgroup>
          </select>
        </label>

        {[
          ["city", "Citta", isHairProfile ? "Milano" : "Milano"],
          ["address", "Indirizzo", isHairProfile ? "Via Montenapoleone 10" : "Via Roma 10"],
          ["website", "Sito web", "https://www.tuodominio.it"],
          ["instagram", "Instagram", isHairProfile ? "@atelierhairmilano" : "@palestraenergia"],
          [
            "tone_of_voice",
            "Tone of voice",
            isHairProfile ? "Elegante, moderno, social-first" : "Professionale, energico, accogliente",
          ],
          [
            "target_audience",
            "Target audience",
            isHairProfile
              ? "Donne 24-45 che cercano colore, styling e beauty experience premium"
              : "Uomini e donne 28-45 che vogliono rimettersi in forma",
          ],
          [
            "preferred_cta",
            "CTA preferita",
            isHairProfile ? "Prenota il tuo appuntamento" : "Prenota la tua prova gratuita",
          ],
          [
            "preferred_hashtags",
            "Hashtag preferiti",
            isHairProfile
              ? "#hairstylemilano #balayageitalia #salonexperience"
              : "#palestramilano #fitnessmilano #wellness",
          ],
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
            placeholder={
              isHairProfile
                ? "Taglio, piega, colore, schiariture, trattamenti, barber service"
                : "Sala pesi, personal training, corsi small group, programmi dimagrimento"
            }
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
            placeholder={
              isHairProfile
                ? "Consulenza personalizzata, experience premium, look su misura"
                : "Allenamenti su misura, ambiente non intimidatorio, coach dedicati"
            }
            className="rounded-[1.5rem] border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
        </label>
      </div>

      {isHairProfile ? (
        <div className="grid gap-6 rounded-[2rem] border border-pink-100 bg-pink-50/60 p-6 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Specialita salone
            <input
              value={form.salon_specialties}
              onChange={(event) =>
                setForm((current) => ({ ...current, salon_specialties: event.target.value }))
              }
              type="text"
              placeholder="Balayage, colore, barber, extension"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-pink-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Link prenotazione
            <input
              value={form.booking_link}
              onChange={(event) =>
                setForm((current) => ({ ...current, booking_link: event.target.value }))
              }
              type="text"
              placeholder="https://tuosalonediprenotazione.it"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-pink-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Orari apertura
            <input
              value={form.opening_hours}
              onChange={(event) =>
                setForm((current) => ({ ...current, opening_hours: event.target.value }))
              }
              type="text"
              placeholder="Mar-Sab 9:00-19:00"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-pink-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Nomi stylist
            <input
              value={form.stylist_names}
              onChange={(event) =>
                setForm((current) => ({ ...current, stylist_names: event.target.value }))
              }
              type="text"
              placeholder="Giulia, Marco, Sofia"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-pink-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Prodotti usati
            <input
              value={form.products_used}
              onChange={(event) =>
                setForm((current) => ({ ...current, products_used: event.target.value }))
              }
              type="text"
              placeholder="Kerastase, Olaplex, Davines"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-pink-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Stile salone
            <input
              value={form.salon_style}
              onChange={(event) =>
                setForm((current) => ({ ...current, salon_style: event.target.value }))
              }
              type="text"
              placeholder="Luxury salon, premium experience, modern barber"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-pink-500"
            />
          </label>
        </div>
      ) : null}

      <div className="rounded-[1.75rem] border border-blue-200 bg-blue-50 p-5 text-sm leading-7 text-slate-700">
        Una volta compilato questo profilo, i generatori AI useranno automaticamente nome attivita,
        tipo di business, citta, tono di voce, target, servizi, punti di forza, CTA e hashtag.
        Per saloni parrucchieri useranno anche specialita, booking link, orari, team, prodotti e
        stile del salone.
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

