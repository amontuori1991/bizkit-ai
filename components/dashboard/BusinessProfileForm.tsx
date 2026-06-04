"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { BusinessProfile } from "@/lib/business-profile";
import { type PaidPlanId, type RuntimePlanId, type UsageProgress } from "@/lib/plan-limits";
import {
  businessTypeOptions,
  isHairBusinessType,
  isSportsBusinessType,
  sportsCenterSubcategoryOptions,
  type BusinessType,
  type SportsCenterSubcategory,
} from "@/lib/business-verticals";

type BusinessProfileFormProps = {
  initialProfiles: BusinessProfile[];
  planId: RuntimePlanId;
  usageProgress: UsageProgress;
  upgradePlan: PaidPlanId | null;
};

type SaveProfileResponse = {
  success?: boolean;
  error?: string;
  profile?: BusinessProfile;
  usage?: {
    progress: {
      businessProfiles: UsageProgress;
    };
  };
  upgradePlan?: PaidPlanId | null;
  upgradeUrl?: string;
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
  sports_subcategory: SportsCenterSubcategory | "";
  salon_specialties: string;
  booking_link: string;
  opening_hours: string;
  stylist_names: string;
  products_used: string;
  salon_style: string;
  is_primary: boolean;
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
    sports_subcategory: (profile?.sports_subcategory as SportsCenterSubcategory | null) ?? "",
    salon_specialties: profile?.salon_specialties ?? "",
    booking_link: profile?.booking_link ?? "",
    opening_hours: profile?.opening_hours ?? "",
    stylist_names: profile?.stylist_names ?? "",
    products_used: profile?.products_used ?? "",
    salon_style: profile?.salon_style ?? "",
    is_primary: profile?.is_primary ?? false,
  };
}

function sortProfiles(profiles: BusinessProfile[]) {
  return [...profiles].sort((first, second) => {
    if (first.is_primary !== second.is_primary) {
      return first.is_primary ? -1 : 1;
    }

    return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
  });
}

export function BusinessProfileForm({
  initialProfiles,
  planId,
  usageProgress,
  upgradePlan,
}: BusinessProfileFormProps) {
  const router = useRouter();
  const sortedInitialProfiles = useMemo(() => sortProfiles(initialProfiles), [initialProfiles]);
  const [profiles, setProfiles] = useState(sortedInitialProfiles);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    sortedInitialProfiles[0]?.id ?? "new",
  );
  const [form, setForm] = useState<FormState>(getInitialForm(sortedInitialProfiles[0] ?? null));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageProgress>(usageProgress);
  const [nextUpgradePlan, setNextUpgradePlan] = useState<PaidPlanId | null>(upgradePlan);

  const selectedProfile =
    selectedProfileId === "new"
      ? null
      : profiles.find((profile) => profile.id === selectedProfileId) ?? null;

  useEffect(() => {
    setForm(getInitialForm(selectedProfile));
  }, [selectedProfile]);

  const isHairProfile = useMemo(() => isHairBusinessType(form.business_type), [form.business_type]);
  const isSportsProfile = useMemo(
    () => isSportsBusinessType(form.business_type),
    [form.business_type],
  );
  const canCreateAnotherProfile = usage.limit === null || profiles.length < usage.limit;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/business-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          profile_id: selectedProfileId === "new" ? undefined : selectedProfileId,
        }),
      });

      const data = (await response.json()) as SaveProfileResponse;
      if (!response.ok || !data.success || !data.profile) {
        setNextUpgradePlan(data.upgradePlan ?? nextUpgradePlan);
        throw new Error(data.error ?? "Salvataggio non riuscito.");
      }

      const nextProfiles = sortProfiles(
        selectedProfileId === "new"
          ? [data.profile, ...profiles]
          : profiles.map((profile) => (profile.id === data.profile?.id ? data.profile : profile)),
      );

      setProfiles(nextProfiles);
      setSelectedProfileId(data.profile.id);
      setForm(getInitialForm(data.profile));
      setUsage(data.usage?.progress.businessProfiles ?? usageProgress);
      setMessage(
        data.profile.is_primary
          ? "Business profile salvato come contesto primario per tutte le generazioni AI."
          : "Business profile aggiornato correttamente.",
      );
      window.dispatchEvent(new CustomEvent("bizkit:business-profile-updated"));
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Piano {planId.toUpperCase()}
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">Capacita business profile</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ogni profilo puo diventare il contesto AI di una singola attivita o verticale.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4">
            <p className="text-sm font-medium text-slate-500">Utilizzo attuale</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {usage.limit === null ? `${usage.used} / illimitato` : `${usage.used} / ${usage.limit}`}
            </p>
            <div className="mt-3 h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                style={{ width: `${usage.limit === null ? 100 : Math.max(8, usage.percent)}%` }}
              />
            </div>
          </div>
        </div>
        {usage.reached && nextUpgradePlan ? (
          <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
            Hai raggiunto il limite del piano {planId.toUpperCase()}.{" "}
            <Link href="/dashboard/billing" className="font-semibold underline underline-offset-4">
              Passa a {nextUpgradePlan.toUpperCase()}
            </Link>{" "}
            per aggiungere altri business profile.
          </div>
        ) : null}
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-950">Profili disponibili</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Seleziona un contesto esistente oppure crea un nuovo profilo per un altro brand o attivita.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedProfileId("new");
              setForm(getInitialForm(null));
              setMessage(null);
              setErrorMessage(null);
            }}
            disabled={!canCreateAnotherProfile}
            className="button-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Nuovo profilo
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {profiles.map((profile) => {
            const active = selectedProfileId === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  setSelectedProfileId(profile.id);
                  setMessage(null);
                  setErrorMessage(null);
                }}
                className={`rounded-[1.25rem] border px-4 py-3 text-left transition ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <p className="text-sm font-semibold">
                  {profile.business_name?.trim() || "Business profile senza nome"}
                </p>
                <p className={`mt-1 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                  {profile.business_type || "tipo business"} {profile.is_primary ? "· Primario" : ""}
                </p>
              </button>
            );
          })}
          {selectedProfileId === "new" ? (
            <div className="rounded-[1.25rem] border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              Nuovo profilo in creazione
            </div>
          ) : null}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Nome attivita
            <input
              value={form.business_name}
              onChange={(event) => setForm((current) => ({ ...current, business_name: event.target.value }))}
              type="text"
              placeholder={
                isHairProfile
                  ? "Atelier Hair Milano"
                  : isSportsProfile
                    ? "Urban Battle Park"
                    : "Palestra Energia"
              }
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
              <optgroup label="Sport & Outdoor">
                {businessTypeOptions
                  .filter((item) => item.vertical === "sports")
                  .map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
              </optgroup>
            </select>
          </label>

          {[
            ["city", "Citta", "Milano"],
            ["address", "Indirizzo", isHairProfile ? "Via Montenapoleone 10" : "Via Roma 10"],
            ["website", "Sito web", "https://www.tuodominio.it"],
            ["instagram", "Instagram", isHairProfile ? "@atelierhairmilano" : "@palestraenergia"],
            [
              "tone_of_voice",
              "Tone of voice",
              isHairProfile
                ? "Elegante, moderno, social-first"
                : isSportsProfile
                  ? "Energico, coinvolgente, orientato all'esperienza"
                  : "Professionale, energico, accogliente",
            ],
            [
              "target_audience",
              "Target audience",
              isHairProfile
                ? "Donne 24-45 che cercano colore, styling e beauty experience premium"
                : isSportsProfile
                  ? "Gruppi amici, aziende, famiglie o sportivi locali che cercano esperienze e prenotazioni rapide"
                : "Uomini e donne 28-45 che vogliono rimettersi in forma",
            ],
            [
              "preferred_cta",
              "CTA preferita",
              isHairProfile
                ? "Prenota il tuo appuntamento"
                : isSportsProfile
                  ? "Prenota il tuo slot"
                  : "Prenota la tua prova gratuita",
            ],
            [
              "preferred_hashtags",
              "Hashtag preferiti",
              isHairProfile
                ? "#hairstylemilano #balayageitalia #salonexperience"
                : isSportsProfile
                  ? "#sportmilano #weekendexperience #prenotaora"
                : "#palestramilano #fitnessmilano #wellness",
            ],
          ].map(([key, label, placeholder]) => (
            <label key={key} className="grid gap-2 text-sm font-medium text-slate-700">
              {label}
              <input
                value={form[key as keyof FormState] as string}
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
                  : isSportsProfile
                    ? "Prenotazioni campo, eventi privati, compleanni, tornei, team building"
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
                  : isSportsProfile
                    ? "Esperienza di gruppo, adrenalina, booking semplice, format eventi pronti"
                  : "Allenamenti su misura, ambiente non intimidatorio, coach dedicati"
              }
              className="rounded-[1.5rem] border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </label>
        </div>

        {isSportsProfile ? (
          <div className="grid gap-6 rounded-[2rem] border border-emerald-100 bg-emerald-50/60 p-6 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Sottocategoria centro sportivo
              <select
                value={form.sports_subcategory}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sports_subcategory: event.target.value as SportsCenterSubcategory | "",
                  }))
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
              >
                <option value="">Seleziona una sottocategoria</option>
                {sportsCenterSubcategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {[
              ["booking_link", "Link prenotazione", "https://prenota.tuocentro.it"],
              ["opening_hours", "Orari apertura", "Lun-Dom 10:00-22:00"],
            ].map(([key, label, placeholder]) => (
              <label key={key} className="grid gap-2 text-sm font-medium text-slate-700">
                {label}
                <input
                  value={form[key as keyof FormState] as string}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                  type="text"
                  placeholder={placeholder}
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
                />
              </label>
            ))}
          </div>
        ) : null}

        {isHairProfile ? (
          <div className="grid gap-6 rounded-[2rem] border border-pink-100 bg-pink-50/60 p-6 lg:grid-cols-2">
            {[
              ["salon_specialties", "Specialita salone", "Balayage, colore, barber, extension"],
              ["booking_link", "Link prenotazione", "https://tuosalonediprenotazione.it"],
              ["opening_hours", "Orari apertura", "Mar-Sab 9:00-19:00"],
              ["stylist_names", "Nomi stylist", "Giulia, Marco, Sofia"],
              ["products_used", "Prodotti usati", "Kerastase, Olaplex, Davines"],
              ["salon_style", "Stile salone", "Luxury salon, premium experience, modern barber"],
            ].map(([key, label, placeholder]) => (
              <label key={key} className="grid gap-2 text-sm font-medium text-slate-700">
                {label}
                <input
                  value={form[key as keyof FormState] as string}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                  type="text"
                  placeholder={placeholder}
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-pink-500"
                />
              </label>
            ))}
          </div>
        ) : null}

        <label className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.is_primary}
            onChange={(event) => setForm((current) => ({ ...current, is_primary: event.target.checked }))}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
          />
          <span>
            Imposta questo profilo come contesto primario. Le generazioni AI useranno automaticamente
            il business profile primario finche non ne selezioni un altro.
          </span>
        </label>

        <div className="rounded-[1.75rem] border border-blue-200 bg-blue-50 p-5 text-sm leading-7 text-slate-700">
          Una volta salvato, questo profilo alimenta automaticamente nome attivita, tipo business,
          citta, tono, target, servizi, CTA, hashtag e, in base al verticale, anche sottocategoria,
          booking, orari, specialita o prodotti usati.
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isSaving}
            className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Salvataggio..." : selectedProfileId === "new" ? "Crea business profile" : "Salva modifiche"}
          </button>
          {message ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}
          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{errorMessage}</p>
              {nextUpgradePlan ? (
                <Link href="/dashboard/billing" className="mt-2 inline-flex font-semibold underline underline-offset-4">
                  Passa a {nextUpgradePlan.toUpperCase()}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
