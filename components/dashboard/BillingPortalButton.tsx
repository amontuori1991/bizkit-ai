"use client";

import { useState } from "react";

type BillingPortalButtonProps = {
  enabled: boolean;
};

export function BillingPortalButton({ enabled }: BillingPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleOpenPortal() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Customer Portal non disponibile.");
      }

      window.location.href = data.url;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Errore durante l'apertura del Customer Portal.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleOpenPortal}
        disabled={!enabled || isLoading}
        className="button-secondary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Apertura portal..." : "Gestisci abbonamento"}
      </button>
      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
