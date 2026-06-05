"use client";

import { useState } from "react";
import { trackDownload, trackEvent } from "@/lib/analytics";

type ProtectedDownloadButtonProps = {
  productSlug: string;
  productName: string;
  assetName: string;
  sessionId?: string;
  buttonLabel?: string;
};

export function ProtectedDownloadButton({
  productSlug,
  productName,
  assetName,
  sessionId,
  buttonLabel = "Scarica il tuo kit",
}: ProtectedDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleDownload() {
    setIsLoading(true);
    setStatus("idle");
    setMessage(null);

    try {
      const query = sessionId
        ? `session_id=${encodeURIComponent(sessionId)}`
        : `product_slug=${encodeURIComponent(productSlug)}`;

      const response = await fetch(`/api/download?${query}`, {
        method: "GET",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({ error: "Download non disponibile." }))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Download non disponibile.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = assetName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);

      trackDownload({
        itemId: productSlug,
        itemName: productName,
        assetName,
      });
      trackEvent("download_started", {
        item_id: productSlug,
        item_name: productName,
        asset_name: assetName,
      });

      setStatus("success");
      setMessage("Download avviato correttamente. Se non parte subito, controlla i download del browser.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Si e verificato un errore durante il download.";
      setStatus("error");
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Preparazione download..." : buttonLabel}
      </button>
      {message ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            status === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
