import type { Metadata } from "next";
import { readSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contatti",
  description:
    "Contatta BizKit AI per richiedere nuovi verticali SaaS, kit digitali, partnership o informazioni commerciali.",
};

export default async function ContactPage() {
  const siteSettings = await readSiteSettings();

  return (
    <section className="section-shell pt-12 sm:pt-16">
      <div className="container-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <span className="eyebrow">Contatti</span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Restiamo in contatto
          </h1>
          <p className="text-lg leading-8 text-slate-600">
            Usa questa pagina per raccogliere richieste commerciali, idee per nuove nicchie SaaS o
            opportunita di collaborazione.
          </p>
          <div className="card-surface p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Contatti diretti
            </p>
            <div className="mt-4 space-y-3 text-slate-700">
              <p>Email: {siteSettings.contactEmail}</p>
              <p>Instagram: {siteSettings.instagramHandle}</p>
              <p>Disponibilita: {siteSettings.businessAvailability}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950">Invia una richiesta</h2>
          <form className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Nome
              <input
                type="text"
                placeholder="Il tuo nome"
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                placeholder="nome@email.it"
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Argomento
              <input
                type="text"
                placeholder="Nuovo vertical SaaS per ristoranti"
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Messaggio
              <textarea
                rows={5}
                placeholder="Scrivi qui la tua richiesta"
                className="rounded-3xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </label>
            <button type="button" className="button-primary w-full sm:w-fit">
              Invia richiesta
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
