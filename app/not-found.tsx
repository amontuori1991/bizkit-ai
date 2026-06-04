import Link from "next/link";
import type { Metadata } from "next";
import { BrandLockup } from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Pagina non trovata",
  description: "Pagina non trovata su BizKit AI, AI Marketing Platform for Local Businesses.",
};

export default function NotFound() {
  return (
    <section className="section-shell pt-16 sm:pt-24">
      <div className="container-shell">
        <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[2rem] border border-slate-200 bg-white px-8 py-12 text-center shadow-soft sm:px-12">
          <BrandLockup
            size="xl"
            className="justify-center"
            tagline="AI Marketing Platform for Local Businesses"
          />
          <span className="mt-8 rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Errore 404
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Pagina non trovata
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
            Il contenuto che stai cercando non e disponibile oppure e stato spostato. Puoi tornare
            alla home oppure aprire direttamente la piattaforma.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="button-primary">
              Torna alla home
            </Link>
            <Link href="/dashboard" className="button-secondary">
              Apri la dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
