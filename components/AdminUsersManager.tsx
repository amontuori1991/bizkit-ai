"use client";

import { useMemo, useState } from "react";
import type { ManagedAdminUser } from "@/lib/admin-users";
import type { RuntimePlanId } from "@/lib/plan-limits";

type AdminUsersManagerProps = {
  initialUsers: ManagedAdminUser[];
  configured: boolean;
};

type ActionResponse = {
  success?: boolean;
  error?: string;
};

const planOptions: RuntimePlanId[] = ["free", "starter", "pro", "agency"];

function formatDateTime(value?: string | null) {
  if (!value) {
    return "N/D";
  }

  return new Date(value).toLocaleString("it-IT");
}

function getPlanBadgeClass(planId: RuntimePlanId) {
  if (planId === "starter") {
    return "bg-blue-50 text-blue-700 border border-blue-200";
  }

  if (planId === "pro") {
    return "bg-violet-50 text-violet-700 border border-violet-200";
  }

  if (planId === "agency") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }

  return "bg-slate-100 text-slate-600 border border-slate-200";
}

function planLabel(planId: RuntimePlanId) {
  return planId.toUpperCase();
}

export function AdminUsersManager({
  initialUsers,
  configured,
}: AdminUsersManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | RuntimePlanId>("all");
  const [onlyTestUsers, setOnlyTestUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.email?.toLowerCase().includes(normalizedQuery) ||
        user.id.toLowerCase().includes(normalizedQuery) ||
        user.fullName?.toLowerCase().includes(normalizedQuery) ||
        user.businessName?.toLowerCase().includes(normalizedQuery);

      const matchesPlan = planFilter === "all" || user.planId === planFilter;
      const matchesTest = !onlyTestUsers || user.hasTestData;

      return Boolean(matchesQuery && matchesPlan && matchesTest);
    });
  }, [onlyTestUsers, planFilter, query, users]);

  async function refreshUsers() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json().catch(() => ({}))) as {
        users?: ManagedAdminUser[];
        error?: string;
      };

      if (!response.ok || !data.users) {
        throw new Error(data.error ?? "Impossibile aggiornare la lista utenti.");
      }

      setUsers(data.users);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Errore durante il refresh utenti.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function runAction(
    key: string,
    action: () => Promise<void>,
    successMessage: string,
  ) {
    setBusyKey(key);
    setMessage(null);
    setErrorMessage(null);

    try {
      await action();
      await refreshUsers();
      setMessage(successMessage);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Errore durante l'operazione admin.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function updatePlan(userId: string, planId: RuntimePlanId) {
    const response = await fetch(`/api/admin/users/${userId}/plan`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = (await response.json().catch(() => ({}))) as ActionResponse;
    if (!response.ok || !data.success) {
      throw new Error(data.error ?? "Aggiornamento piano non riuscito.");
    }
  }

  async function resetUsage(userId: string) {
    const response = await fetch(`/api/admin/users/${userId}/reset-usage`, {
      method: "POST",
    });
    const data = (await response.json().catch(() => ({}))) as ActionResponse;
    if (!response.ok || !data.success) {
      throw new Error(data.error ?? "Reset usage non riuscito.");
    }
  }

  async function deleteUserData(userId: string, action: string) {
    const response = await fetch(`/api/admin/users/${userId}/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = (await response.json().catch(() => ({}))) as ActionResponse;
    if (!response.ok || !data.success) {
      throw new Error(data.error ?? "Cancellazione dati non riuscita.");
    }
  }

  async function deleteUserCompletely(userId: string) {
    const confirmText = window.prompt(
      "Questa azione elimina completamente l'utente da Supabase Auth e dal database.\n\nDigita DELETE per confermare.",
    );

    if (confirmText === null) {
      return;
    }

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmText }),
    });
    const data = (await response.json().catch(() => ({}))) as ActionResponse;
    if (!response.ok || !data.success) {
      throw new Error(data.error ?? "Eliminazione completa non riuscita.");
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">Gestione utenti</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Utenti registrati
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Controlla piani, usage e dati applicativi per ogni account, con strumenti rapidi per
            test, manutenzione e cleanup.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshUsers()}
          disabled={loading || !configured}
          className="button-secondary"
        >
          {loading ? "Aggiorno..." : "Aggiorna lista"}
        </button>
      </div>

      {!configured ? (
        <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-700">
          `SUPABASE_SERVICE_ROLE_KEY` non configurata. Questa pagina richiede la service role per
          elencare utenti Auth e gestire operazioni admin sicure.
        </div>
      ) : null}

      {message ? (
        <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.45fr_0.45fr]">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Cerca per email o user_id
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="es. utente@email.com oppure UUID"
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Filtro piano
          <select
            value={planFilter}
            onChange={(event) => setPlanFilter(event.target.value as "all" | RuntimePlanId)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          >
            <option value="all">Tutti i piani</option>
            {planOptions.map((plan) => (
              <option key={plan} value={plan}>
                {planLabel(plan)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={onlyTestUsers}
            onChange={(event) => setOnlyTestUsers(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
          />
          Solo utenti con dati test
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">
          Totale: {users.length}
        </span>
        <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
          Visibili: {filteredUsers.length}
        </span>
      </div>

      <div className="mt-6 grid gap-5">
        {filteredUsers.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Nessun utente corrisponde ai filtri attuali.
          </div>
        ) : (
          filteredUsers.map((user) => {
            const actionBusy = (suffix: string) => busyKey === `${user.id}:${suffix}`;

            return (
              <article
                key={user.id}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getPlanBadgeClass(user.planId)}`}
                      >
                        {planLabel(user.planId)}
                      </span>
                      {user.subscriptionStatus ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          subscription: {user.subscriptionStatus}
                        </span>
                      ) : null}
                      {user.cancelAtPeriodEnd ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          non si rinnova
                        </span>
                      ) : null}
                      {user.hasTestData ? (
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                          dati test
                        </span>
                      ) : null}
                    </div>

                    <h2 className="mt-3 text-xl font-bold text-slate-950">
                      {user.fullName?.trim() || user.email || "Utente senza nome"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {user.email ?? "Email non disponibile"}
                    </p>
                    <p className="mt-2 break-all text-xs text-slate-500">user_id: {user.id}</p>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
                      <p>Registrato il: <span className="font-semibold text-slate-900">{formatDateTime(user.createdAt)}</span></p>
                      <p>Ultimo accesso: <span className="font-semibold text-slate-900">{formatDateTime(user.lastAccessAt)}</span></p>
                      <p>Business: <span className="font-semibold text-slate-900">{user.businessName?.trim() || "Non impostato"}</span></p>
                      <p>Business profile: <span className="font-semibold text-slate-900">{user.businessProfilesCount}</span></p>
                      <p>Generazioni: <span className="font-semibold text-slate-900">{user.generatedContentsCount}</span></p>
                      <p>Salvati: <span className="font-semibold text-slate-900">{user.savedContentsCount}</span></p>
                      <p>Calendari: <span className="font-semibold text-slate-900">{user.calendarsCount}</span></p>
                      <p>Clienti CRM: <span className="font-semibold text-slate-900">{user.crmClientsCount}</span></p>
                      <p>Fine periodo: <span className="font-semibold text-slate-900">{formatDateTime(user.currentPeriodEnd)}</span></p>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 xl:min-w-[320px]">
                    <div className="grid gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Piano utente
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {planOptions.map((plan) => (
                          <button
                            key={plan}
                            type="button"
                            disabled={actionBusy(`plan:${plan}`) || !configured}
                            onClick={() =>
                              void runAction(
                                `${user.id}:plan:${plan}`,
                                () => updatePlan(user.id, plan),
                                `Piano utente aggiornato a ${planLabel(plan)}.`,
                              )
                            }
                            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                              user.planId === plan
                                ? "bg-slate-950 text-white"
                                : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:text-blue-700"
                            } disabled:opacity-60`}
                          >
                            {actionBusy(`plan:${plan}`) ? "..." : planLabel(plan)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <button
                        type="button"
                        disabled={actionBusy("reset-usage") || !configured}
                        onClick={() =>
                          void runAction(
                            `${user.id}:reset-usage`,
                            async () => {
                              if (!window.confirm("Resetto l'usage AI di oggi per questo utente?")) {
                                return;
                              }
                              await resetUsage(user.id);
                            },
                            "Usage AI di oggi resettato.",
                          )
                        }
                        className="button-secondary justify-center"
                      >
                        {actionBusy("reset-usage") ? "Reset..." : "Reset usage AI di oggi"}
                      </button>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        ["test-data", "Cancella dati test"],
                        ["saved-contents", "Cancella contenuti salvati"],
                        ["calendars", "Cancella calendari"],
                        ["crm-clients", "Cancella clienti CRM"],
                        ["business-profiles", "Cancella business profile"],
                        ["local-subscription", "Cancella subscription locale"],
                      ].map(([action, label]) => (
                        <button
                          key={action}
                          type="button"
                          disabled={actionBusy(action) || !configured}
                          onClick={() =>
                            void runAction(
                              `${user.id}:${action}`,
                              async () => {
                                if (!window.confirm(`${label}?`)) {
                                  return;
                                }
                                await deleteUserData(user.id, action);
                              },
                              `${label} completato.`,
                            )
                          }
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
                        >
                          {actionBusy(action) ? "Eseguo..." : label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={actionBusy("delete-complete") || !configured}
                      onClick={() =>
                        void runAction(
                          `${user.id}:delete-complete`,
                          () => deleteUserCompletely(user.id),
                          "Utente eliminato completamente.",
                        )
                      }
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      {actionBusy("delete-complete")
                        ? "Eliminazione completa..."
                        : "Elimina completamente utente"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
