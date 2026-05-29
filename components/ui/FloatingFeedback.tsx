"use client";

import { useEffect } from "react";

type FloatingFeedbackProps = {
  type: "success" | "error";
  message: string | null;
  onClose: () => void;
};

export function FloatingFeedback({ type, message, onClose }: FloatingFeedbackProps) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onClose();
    }, 4500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[80] w-[min(28rem,calc(100vw-2rem))] sm:right-6 sm:top-24">
      <div
        className={`pointer-events-auto rounded-[1.5rem] border px-4 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur ${
          type === "success"
            ? "border-emerald-200 bg-emerald-50/95 text-emerald-800"
            : "border-red-200 bg-red-50/95 text-red-800"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
              type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <p className="flex-1 text-sm leading-6">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-xs font-semibold text-current/80 transition hover:bg-black/5 hover:text-current"
            aria-label="Chiudi messaggio"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
