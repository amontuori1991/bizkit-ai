"use client";

import Link from "next/link";
import { useState } from "react";
import type { BusinessProfile } from "@/lib/business-profile";
import { type PaidPlanId, type UsageProgress } from "@/lib/plan-limits";
import { isHairBusinessType, isSportsBusinessType } from "@/lib/business-verticals";
import { getSportsKnowledgePack } from "@/lib/sportsKnowledgePacks";

type ClientRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  membership_plan: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

type ClientsManagerProps = {
  initialClients: ClientRecord[];
  usageProgress: UsageProgress;
  upgradePlan: PaidPlanId | null;
  businessProfile: BusinessProfile | null;
};

function getCrmCopy(profile: BusinessProfile | null) {
  if (isSportsBusinessType(profile?.business_type)) {
    return {
      entityLabel: "contatto",
      formTitle: "Nuovo contatto",
      listTitle: "Contatti salvati",
      planLabel: "Pacchetto / esperienza",
      planPlaceholder: "Weekend gruppi paintball",
      notesPlaceholder:
        "Data evento, numero partecipanti, caparra, disponibilita, preferenze del gruppo",
    };
  }

  if (isHairBusinessType(profile?.business_type)) {
    return {
      entityLabel: "cliente",
      formTitle: "Nuova cliente",
      listTitle: "Clienti salvati",
      planLabel: "Servizio / trattamento",
      planPlaceholder: "Balayage + piega",
      notesPlaceholder:
        "Preferenze, ultimo trattamento, frequenza visita, note commerciali o follow-up",
    };
  }

  return {
    entityLabel: "cliente",
    formTitle: "Nuovo cliente",
    listTitle: "Clienti salvati",
    planLabel: "Abbonamento / piano",
    planPlaceholder: "Mensile premium",
    notesPlaceholder: "Obiettivi, stato trattativa, appunti operativi",
  };
}

export function ClientsManager({
  initialClients,
  usageProgress,
  upgradePlan,
  businessProfile,
}: ClientsManagerProps) {
  const [clients, setClients] = useState(initialClients);
  const [usage, setUsage] = useState(usageProgress);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    membership_plan: "",
    status: "lead",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nextUpgradePlan, setNextUpgradePlan] = useState<PaidPlanId | null>(upgradePlan);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const sportsPack = isSportsBusinessType(businessProfile?.business_type)
    ? getSportsKnowledgePack(businessProfile?.sports_subcategory)
    : null;
  const sportsSuggestions = isSportsBusinessType(businessProfile?.business_type)
    ? sportsPack?.crmSuggestions ?? []
    : [];
  const sportsMessageTemplates =
    sportsPack?.crmTemplates.filter((template) => Boolean(template.body)) ?? [];
  const crmCopy = getCrmCopy(businessProfile);
  const templateDownloadHref = isSportsBusinessType(businessProfile?.business_type)
    ? "/downloads/ai-kit-per-centri-sportivi-outdoor/template-import-contatti-centri-sportivi.xlsx"
    : isHairBusinessType(businessProfile?.business_type)
      ? "/downloads/ai-kit-per-parrucchieri/template-import-contatti-parrucchieri.xlsx"
      : "/downloads/ai-kit-per-palestre/template-import-contatti-palestre.xlsx";

  async function copyTemplate(template: string) {
    try {
      await navigator.clipboard.writeText(template);
      setCopyFeedback("Template copiato negli appunti.");
      window.setTimeout(() => setCopyFeedback(null), 2500);
    } catch {
      setCopyFeedback("Copia non riuscita. Riprova.");
      window.setTimeout(() => setCopyFeedback(null), 2500);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as {
        client?: ClientRecord;
        error?: string;
        upgradePlan?: PaidPlanId | null;
      };
      if (!response.ok || !data.client) {
        setNextUpgradePlan(data.upgradePlan ?? nextUpgradePlan);
        throw new Error(data.error ?? "Impossibile creare il cliente.");
      }

      setClients((current) => [data.client as ClientRecord, ...current]);
      setUsage((current) => ({
        ...current,
        used: current.used + 1,
        remaining: current.remaining === null ? null : Math.max(0, current.remaining - 1),
        percent:
          current.limit === null
            ? 0
            : Math.min(100, Math.round(((current.used + 1) / current.limit) * 100)),
        reached: current.limit === null ? false : current.used + 1 >= current.limit,
      }));
      setForm({
        name: "",
        email: "",
        phone: "",
        membership_plan: "",
        status: "lead",
        notes: "",
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante il salvataggio.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsImporting(true);
    setErrorMessage(null);
    setImportFeedback(null);

    try {
      const formData = new FormData(event.currentTarget);
      const file = formData.get("file");

      if (!(file instanceof File) || !file.name) {
        throw new Error("Seleziona prima un file .xlsx o .csv da importare.");
      }

      const response = await fetch("/api/crm/clients/import", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        clients?: ClientRecord[];
        importedCount?: number;
        skippedRows?: number;
        error?: string;
        upgradePlan?: PaidPlanId | null;
      };

      if (!response.ok || !data.clients) {
        setNextUpgradePlan(data.upgradePlan ?? nextUpgradePlan);
        throw new Error(data.error ?? "Import non riuscito.");
      }

      setClients((current) => [...(data.clients as ClientRecord[]), ...current]);
      setUsage((current) => {
        const nextUsed = current.used + (data.importedCount ?? 0);
        return {
          ...current,
          used: nextUsed,
          remaining: current.remaining === null ? null : Math.max(0, current.remaining - (data.importedCount ?? 0)),
          percent:
            current.limit === null ? 0 : Math.min(100, Math.round((nextUsed / current.limit) * 100)),
          reached: current.limit === null ? false : nextUsed >= current.limit,
        };
      });

      const feedbackBase = `${data.importedCount ?? 0} contatti importati con successo.`;
      setImportFeedback(
        (data.skippedRows ?? 0) > 0
          ? `${feedbackBase} ${data.skippedRows} righe sono state ignorate perche incomplete.`
          : feedbackBase,
      );
      event.currentTarget.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante l'import.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Capacita CRM</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tieni sotto controllo quante anagrafiche hai gia in piattaforma rispetto al piano attivo.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {usage.limit === null ? "Illimitato" : `${usage.percent}%`}
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-950">
            {usage.limit === null ? `${usage.used} / illimitato` : `${usage.used} / ${usage.limit}`}
          </p>
          <div className="mt-4 h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
              style={{ width: `${usage.limit === null ? 100 : Math.max(8, usage.percent)}%` }}
            />
          </div>
        {usage.reached && nextUpgradePlan ? (
          <Link href="/dashboard/billing" className="mt-4 inline-flex text-sm font-semibold text-blue-700">
            Passa a {nextUpgradePlan.toUpperCase()}
          </Link>
        ) : null}
        {sportsSuggestions.length > 0 ? (
          <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <p className="font-semibold">Suggerimenti CRM sport & outdoor</p>
            <div className="mt-2 grid gap-2">
              {sportsSuggestions.map((suggestion) => (
                <p key={suggestion}>{suggestion}</p>
              ))}
            </div>
          </div>
        ) : null}
        {sportsMessageTemplates.length > 0 ? (
          <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  CRM {sportsPack?.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Template rapidi per conferme, reminder, follow-up, recensioni e proposte coerenti con la sottocategoria attiva.
                </p>
              </div>
              {copyFeedback ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {copyFeedback}
                </span>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3">
              {sportsMessageTemplates.map((template) => (
                <div key={template.title} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950">{template.title}</p>
                    <button
                      type="button"
                      onClick={() => copyTemplate(template.body ?? "")}
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-700"
                    >
                      Copia template
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{template.body}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">{crmCopy.formTitle}</h2>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            {[
              ["name", "Nome cliente", "Mario Rossi"],
              ["email", "Email", "cliente@email.it"],
              ["phone", "Telefono", "+39 333 1234567"],
              ["membership_plan", crmCopy.planLabel, crmCopy.planPlaceholder],
            ].map(([key, label, placeholder]) => (
              <label key={key} className="grid gap-2 text-sm font-medium text-slate-700">
                {label}
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                  type="text"
                  placeholder={placeholder}
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                  required={key === "name"}
                />
              </label>
            ))}
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Stato
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              >
                <option value="lead">Lead</option>
                <option value="attivo">Attivo</option>
                <option value="follow-up">Follow-up</option>
                <option value="inattivo">Inattivo</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Note
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                rows={4}
                placeholder={crmCopy.notesPlaceholder}
                className="rounded-[1.5rem] border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </label>
            <button type="submit" disabled={isLoading} className="button-primary disabled:cursor-not-allowed disabled:opacity-70">
              {isLoading ? "Salvataggio..." : `Aggiungi ${crmCopy.entityLabel}`}
            </button>
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
          </form>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Import dedicato</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Scarica il template Excel della tua verticale, compila i contatti e importali in blocco nel CRM.
              </p>
            </div>
            <a href={templateDownloadHref} className="button-secondary" download>
              Scarica template .xlsx
            </a>
          </div>
          <form onSubmit={handleImport} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              File contatti
              <input
                name="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-blue-500"
                required
              />
            </label>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">Colonne supportate</p>
              <p className="mt-2">
                `name`, `email`, `phone`, `{crmCopy.planLabel}`, `status`, `notes`
              </p>
              <p className="mt-2">
                Puoi usare anche intestazioni in italiano come `Nome`, `Telefono`, `Stato`, `Note`, `Pacchetto`, `Servizio` o `Abbonamento`.
              </p>
            </div>
            <button
              type="submit"
              disabled={isImporting}
              className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isImporting ? "Import in corso..." : "Importa contatti"}
            </button>
            {importFeedback ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {importFeedback}
              </div>
            ) : null}
          </form>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-950">{crmCopy.listTitle}</h2>
        <div className="mt-6 grid gap-4">
          {clients.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Nessun {crmCopy.entityLabel} ancora presente. Aggiungi il primo dal form.
            </div>
          ) : (
            clients.map((client) => (
              <div key={client.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{client.name}</p>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {client.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  <p>Email: {client.email || "-"}</p>
                  <p>Telefono: {client.phone || "-"}</p>
                  <p>{crmCopy.planLabel}: {client.membership_plan || "-"}</p>
                  <p>Note: {client.notes || "-"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
