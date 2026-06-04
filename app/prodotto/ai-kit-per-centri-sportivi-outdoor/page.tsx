import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PricingBox } from "@/components/PricingBox";
import { ProductViewTracker } from "@/components/ProductViewTracker";
import { faqs, products } from "@/data/products";

export const metadata: Metadata = {
  title: "AI Kit Centri Sportivi & Outdoor",
  description:
    "Acquista AI Kit Centri Sportivi & Outdoor a 29 EUR: prompt, caption, Reel, promo e messaggi clienti per paintball, padel, calcetto e attivita multisport, con focus forte su gruppi ed eventi paintball.",
};

const includedGenerators = [
  "Caption AI per promo weekend, compleanni, tornei, addii al celibato ed eventi gruppo",
  "Reel e hook video per adrenalina, backstage, POV partita, prenotazioni e community locale",
  "Promo AI per slot, campi, team building, compleanni, eventi privati e offerte last minute",
  "Messaggi clienti per reminder, recupero inattivi, follow-up prenotazioni e richieste recensione",
];

const benefits = [
  {
    title: "Piu prenotazioni",
    description:
      "Contenuti e CTA pensati per spingere booking, richieste WhatsApp, gruppi, eventi privati e weekend sold-out.",
  },
  {
    title: "Format piu adatti al tuo sport",
    description:
      "Hook, promo e messaggi si adattano a paintball, padel, calcetto, tennis, multisport e attivita outdoor, con un focus forte su Paintball reale.",
  },
  {
    title: "Eventi e clienti gestiti meglio",
    description:
      "Hai template pronti per team building, compleanni, addii al celibato, tornei, no-show, promo slot liberi e follow-up.",
  },
];

export default function ProductSportsCenterPage() {
  const product = products.find((item) => item.slug === "ai-kit-per-centri-sportivi-outdoor");

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductViewTracker
        itemId={product.slug}
        itemName={product.name}
        category={product.category}
        price={29}
      />
      <section className="section-shell pt-12 sm:pt-16">
        <div className="container-shell grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <span className="eyebrow border-emerald-200 bg-emerald-50 text-emerald-700">
              {product.category}
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                {product.name}
              </h1>
              <p className="text-lg leading-8 text-slate-600">{product.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card-surface p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Ideale per
                </p>
                <p className="mt-3 leading-7 text-slate-700">
                  Paintball, softair, laser tag, padel, calcetto, tennis, beach volley, go kart,
                  adventure park e strutture multisport che vogliono piu contenuti e piu prenotazioni.
                  Il caso d uso piu forte e Paintball, con scenari gia pensati per compleanni,
                  addii al celibato, team building, promo weekend e gruppi numerosi.
                </p>
              </div>
              <div className="card-surface p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Consegna
                </p>
                <p className="mt-3 leading-7 text-slate-700">
                  Accesso immediato dopo il pagamento con download del kit e demo pubblica gia pronta
                  per testare la verticale sport & outdoor.
                </p>
              </div>
            </div>
          </div>
          <PricingBox
            name={product.name}
            price={product.price}
            features={product.includes}
            cta={{ href: `/checkout?product=${product.slug}`, label: "Acquista ora" }}
            note="Pagamento one-shot con Stripe Checkout. Dopo l'acquisto ricevi subito il download del pacchetto sport & outdoor."
          />
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <span className="eyebrow">Cosa include</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Un kit operativo gia pensato per booking, gruppi ed eventi
            </h2>
            <p className="leading-7 text-slate-600">
              Prompt, format e asset pronti per trasformare attivita sportive e outdoor in contenuti
              piu frequenti, promo piu forti e comunicazioni clienti piu semplici da gestire.
              Per Paintball trovi un taglio ancora piu pratico su sicurezza, prima volta, briefing,
              pacchetti gruppo e prenotazioni del weekend.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.includes.map((item) => (
              <div key={item} className="card-surface p-5">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <p className="font-semibold text-slate-900">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="card-surface p-6">
              <h3 className="text-xl font-semibold text-slate-950">{benefit.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4">
            <span className="eyebrow">Generatori inclusi</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Il kit e gia allineato alla piattaforma SaaS
            </h2>
            <p className="leading-7 text-slate-600">
              Oltre al download, puoi testare la demo pubblica e poi passare ai generatori completi
              della dashboard per sport center, attivita outdoor e strutture multisport. Se il tuo
              business profile usa la sottocategoria Paintball, la piattaforma rende piu specifici
              caption, Reel, promo, calendario editoriale e messaggi clienti.
            </p>
          </div>
          <div className="grid gap-4">
            {includedGenerators.map((item) => (
              <div key={item} className="card-surface p-5">
                <p className="font-semibold text-slate-900">{item}</p>
              </div>
            ))}
            <div className="card-surface flex flex-col gap-3 p-5 sm:flex-row">
              <Link href="/demo?vertical=sports" className="button-secondary text-center">
                Prova la demo sport & outdoor
              </Link>
              <Link href={`/checkout?product=${product.slug}`} className="button-primary text-center">
                Acquista il kit
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell">
          <div className="mb-8 space-y-3">
            <span className="eyebrow">FAQ prodotto</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Domande utili prima del checkout
            </h2>
          </div>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <CTASection
        title="Vuoi usare il kit sport & outdoor subito oppure testare anche il SaaS?"
        description="Puoi acquistare il pacchetto come prodotto singolo oppure entrare nella piattaforma BizKit AI con generatori, storico, CRM e planner completo."
        primaryCta={{ href: `/checkout?product=${product.slug}`, label: "Acquista ora" }}
        secondaryCta={{ href: "/demo?vertical=sports", label: "Prova la demo sport & outdoor" }}
      />
    </>
  );
}
