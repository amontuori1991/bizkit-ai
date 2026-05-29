"use client";

import { useState } from "react";
import { trackDownload } from "@/lib/analytics";

type ProtectedDownloadButtonProps = {
  sessionId: string;
  productSlug: string;
  productName: string;
  assetName: string;
};

export function ProtectedDownloadButton({
  sessionId,
  productSlug,
  productName,
  assetName,
}: ProtectedDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleDownload() {
    setIsLoading(true);
    setStatus("idle");
    setMessage(null);

    try {
      const response = await fetch(`/api/download?session_id=${encodeURIComponent(sessionId)}`, {
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
        {isLoading ? "Preparazione download..." : "Scarica il tuo kit"}
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
