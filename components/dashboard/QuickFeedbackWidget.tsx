"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FeedbackForm } from "@/components/dashboard/FeedbackForm";
import { DashboardIcon } from "@/components/dashboard/DashboardIcon";
import { FloatingFeedback } from "@/components/ui/FloatingFeedback";
import type { FeedbackItem } from "@/lib/feedback";

export function QuickFeedbackWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  if (pathname === "/dashboard/feedback") {
    return null;
  }

  function handleCreated(_feedback: FeedbackItem) {
    setIsOpen(false);
    setMessage("Grazie! Il tuo feedback è stato registrato.");
  }

  return (
    <>
      <FloatingFeedback type="success" message={message} onClose={() => setMessage(null)} />

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[75] inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:bg-slate-900"
      >
        <DashboardIcon name="feedback" className="h-4 w-4" />
        💡 Invia feedback
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[85] flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.24)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Quick feedback
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Cosa possiamo migliorare?</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Segnala un bug, una richiesta o un punto di frizione mentre stai usando la piattaforma.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Chiudi
              </button>
            </div>

            <div className="mt-6">
              <FeedbackForm compact submitLabel="Invia feedback" onCreated={handleCreated} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
