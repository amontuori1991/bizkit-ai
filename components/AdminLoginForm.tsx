"use client";

import { useState } from "react";

type LoginResponse = {
  success?: boolean;
  error?: string;
};

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Accesso non riuscito.");
      }

      window.location.href = "/admin";
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Errore durante il login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Password admin
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Inserisci la password"
          className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          required
        />
      </label>
      <button
        type="submit"
        disabled={isLoading}
        className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Accesso..." : "Entra nella dashboard"}
      </button>
      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
