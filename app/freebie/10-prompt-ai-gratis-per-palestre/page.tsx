import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "10 Prompt AI Gratis per Palestre",
  description:
    "Scarica il freebie BizKit AI con 10 prompt AI gratuiti per palestre e personal trainer.",
  robots: {
    index: false,
    follow: false,
  },
};

const highlights = [
  "10 prompt pronti da usare",
  "Idee per contenuti, offerte e WhatsApp",
  "PDF gratuito immediato",
  "Perfetto come assaggio del kit premium",
];

export default function FreebiePage() {
  return (
    <section className="section-shell pt-10 sm:pt-14">
      <div className="container-shell">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-blue-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(219,234,254,0.8)_30%,_rgba(15,23,42,0.05)_100%)] p-8 shadow-soft sm:p-10">
          <span className="eyebrow">Free Download</span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            10 Prompt AI Gratis per Palestre
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Controlla la tua email. Intanto puoi scaricare subito anche da qui il mini kit gratuito.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-white/60 bg-white/80 p-4 text-slate-700">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/downloads/freebies/10-prompt-ai-gratis-per-palestre.pdf"
              className="button-primary"
              download
            >
              Scarica gratis
            </a>
            <Link href="/prodotto/ai-kit-per-palestre" className="button-secondary">
              Scopri il kit completo
            </Link>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Integrazioni future
            </p>
            <p className="mt-3 leading-7 text-slate-600">
              Questa acquisizione lead e gia pronta per essere collegata a Resend, Mailchimp o
              ConvertKit senza cambiare l&apos;esperienza utente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
