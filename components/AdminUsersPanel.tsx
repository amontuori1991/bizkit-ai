"use client";

import { useMemo, useState } from "react";
import type { AdminUser } from "@/lib/admin-data";

type AdminUsersPanelProps = {
  initialUsers: AdminUser[];
  configured: boolean;
  isDark: boolean;
};

export function AdminUsersPanel({
  initialUsers,
  configured,
  isDark,
}: AdminUsersPanelProps) {
  const [users, setUsers] = useState(initialUsers);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const card = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const subtle = isDark ? "text-slate-400" : "text-slate-500";

  const paidUsers = useMemo(
    () => users.filter((user) => user.subscriptionTier && user.subscriptionTier !== "free").length,
    [users],
  );

  async function handleDelete(user: AdminUser) {
    const label = user.email ?? user.fullName ?? user.id;
    const confirmed = window.confirm(
      `Vuoi eliminare definitivamente l'utente ${label}?\n\nL'account Auth Supabase verra rimosso e i dati collegati seguiranno le regole di cascade del database.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingUserId(user.id);
    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Eliminazione utente non riuscita.");
      }

      setUsers((current) => current.filter((item) => item.id !== user.id));
      setMessage(`Utente ${label} eliminato correttamente.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Errore durante l'eliminazione dell'utente.",
      );
    } finally {
      setDeletingUserId(null);
    }
  }

  return (
    <section className={`rounded-[2rem] border p-6 shadow-soft ${card}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Utenti registrati</h2>
          <p className={`mt-3 max-w-2xl leading-7 ${subtle}`}>
            Gestisci i profili utente registrati e rimuovi account non piu necessari direttamente
            dall&apos;admin. La cancellazione agisce su Supabase Auth.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`rounded-[1.25rem] border px-4 py-4 ${card}`}>
            <p className={`text-xs uppercase tracking-[0.18em] ${subtle}`}>Totale utenti</p>
            <p className="mt-2 text-2xl font-bold">{users.length}</p>
          </div>
          <div className={`rounded-[1.25rem] border px-4 py-4 ${card}`}>
            <p className={`text-xs uppercase tracking-[0.18em] ${subtle}`}>Utenti paid</p>
            <p className="mt-2 text-2xl font-bold">{paidUsers}</p>
          </div>
        </div>
      </div>

      {!configured ? (
        <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-700">
          `SUPABASE_SERVICE_ROLE_KEY` non configurata. Per vedere ed eliminare utenti da qui serve
          il client admin Supabase lato server.
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

      <div className="mt-6 grid gap-4">
        {users.length === 0 ? (
          <div className={`rounded-[1.5rem] border p-5 ${card}`}>
            <p className={subtle}>Nessun utente disponibile da mostrare.</p>
          </div>
        ) : (
          users.map((user) => (
            <article key={user.id} className={`rounded-[1.5rem] border p-5 ${card}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {(user.subscriptionTier ?? "free").toUpperCase()}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {new Date(user.createdAt).toLocaleDateString("it-IT")}
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-slate-950">
                    {user.fullName?.trim() || user.email || "Utente senza nome"}
                  </p>
                  <p className={`mt-1 text-sm ${subtle}`}>{user.email ?? "Email non disponibile"}</p>
                  <p className={`mt-2 text-sm ${subtle}`}>
                    Business: {user.businessName?.trim() || "Non impostato"}
                  </p>
                  <p className={`mt-2 break-all text-xs ${subtle}`}>ID: {user.id}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDelete(user)}
                  disabled={deletingUserId === user.id || !configured}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingUserId === user.id ? "Elimino..." : "Elimina utente"}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
