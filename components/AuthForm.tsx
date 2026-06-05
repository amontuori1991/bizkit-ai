"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthFormProps = {
  mode: "login" | "signup";
  disabled?: boolean;
  disabledMessage?: string;
};

export function AuthForm({ mode, disabled = false, disabledMessage }: AuthFormProps) {
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      setErrorMessage(
        disabledMessage || "Autenticazione non disponibile finche Supabase non e configurato.",
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Supabase non e configurato. Controlla /admin/setup.");
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        trackEvent("login_completed", {}, { logToServer: true });
        window.location.href = "/dashboard";
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName,
          },
        },
      });

      if (error) {
        throw error;
      }

      trackEvent("signup_completed", {}, { logToServer: true });
      setSuccessMessage("Account creato. Se la conferma email e attiva in Supabase, controlla la tua inbox.");
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante l'autenticazione.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {mode === "signup" ? (
        <>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Nome
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              type="text"
              placeholder="Mario Rossi"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
              disabled={disabled}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Attivita
            <input
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              type="text"
              placeholder="Palestra Energia"
              className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
              disabled={disabled}
            />
          </label>
        </>
      ) : null}
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Email
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="nome@email.it"
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          required
          disabled={disabled}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Password
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder="Minimo 8 caratteri"
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          required
          disabled={disabled}
        />
      </label>
      <button
        type="submit"
        disabled={isLoading || disabled}
        className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {disabled ? "Configura Supabase" : isLoading ? "Attendi..." : mode === "login" ? "Accedi" : "Crea account"}
      </button>
      {disabled && disabledMessage ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {disabledMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}
    </form>
  );
}
