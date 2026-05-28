"use client";

import { useState } from "react";

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
};

export function ClientsManager({ initialClients }: ClientsManagerProps) {
  const [clients, setClients] = useState(initialClients);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    membership_plan: "",
    status: "lead",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      const data = (await response.json()) as { client?: ClientRecord; error?: string };
      if (!response.ok || !data.client) {
        throw new Error(data.error ?? "Impossibile creare il cliente.");
      }

      setClients((current) => [data.client as ClientRecord, ...current]);
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

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-950">Nuovo cliente</h2>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          {[
            ["name", "Nome cliente", "Mario Rossi"],
            ["email", "Email", "cliente@email.it"],
            ["phone", "Telefono", "+39 333 1234567"],
            ["membership_plan", "Piano", "Mensile premium"],
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
              placeholder="Obiettivi, stato trattativa, appunti operativi"
              className="rounded-[1.5rem] border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </label>
          <button type="submit" disabled={isLoading} className="button-primary disabled:cursor-not-allowed disabled:opacity-70">
            {isLoading ? "Salvataggio..." : "Aggiungi cliente"}
          </button>
          {errorMessage ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}
        </form>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-950">Clienti salvati</h2>
        <div className="mt-6 grid gap-4">
          {clients.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Nessun cliente ancora presente. Aggiungi il primo dal form.
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
                  <p>Email: {client.email || "—"}</p>
                  <p>Telefono: {client.phone || "—"}</p>
                  <p>Piano: {client.membership_plan || "—"}</p>
                  <p>Note: {client.notes || "—"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
