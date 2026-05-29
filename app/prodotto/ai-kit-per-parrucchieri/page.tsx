import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PricingBox } from "@/components/PricingBox";
import { ProductViewTracker } from "@/components/ProductViewTracker";
import { faqs, products } from "@/data/products";

export const metadata: Metadata = {
  title: "AI Kit per Parrucchieri",
  description:
    "Acquista AI Kit per Parrucchieri a 29 EUR: prompt, caption, Reel, promo e messaggi clienti per saloni hair, barber shop e hair stylist.",
};

const includedGenerators = [
  "Caption AI beauty con hook e CTA orientate al booking",
  "Reel e TikTok hook per prima/dopo, trend e promo stagionali",
  "Promo AI per colore, piega, trattamenti e offerte last minute",
  "Messaggi clienti per reminder appuntamento, follow-up e retention",
];

const benefits = [
  {
    title: "Più prenotazioni",
    description:
      "Contenuti e CTA pensati per spingere booking, richieste DM e appuntamenti in salone.",
  },
  {
    title: "Contenuti più moderni",
    description:
      "Hook beauty-first, format Instagram e idee TikTok più adatte a trasformazioni, look e trend.",
  },
  {
    title: "Clienti gestiti meglio",
    description:
      "Messaggi pronti per reminder, no-show, clienti inattive e promo mirate su servizi hair.",
  },
];

export default function ProductHairPage() {
  const product = products.find((item) => item.slug === "ai-kit-per-parrucchieri");

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
            <span className="eyebrow border-pink-200 bg-pink-50 text-pink-700">
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
                  Saloni parrucchieri, barber shop e hair stylist che vogliono contenuti più
                  curati, promo più efficaci e comunicazioni clienti più costanti.
                </p>
              </div>
              <div className="card-surface p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Consegna
                </p>
                <p className="mt-3 leading-7 text-slate-700">
                  Accesso immediato dopo il pagamento con download del kit e possibilità di testare
                  anche la demo AI dedicata al verticale hair.
                </p>
              </div>
            </div>
          </div>
          <PricingBox
            name={product.name}
            price={product.price}
            features={product.includes}
            cta={{ href: `/checkout?product=${product.slug}`, label: "Acquista ora" }}
            note="Pagamento one-shot con Stripe Checkout. Dopo l'acquisto ricevi subito il download del pacchetto hair."
          />
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <span className="eyebrow">Cosa include</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Un kit operativo già pensato per il beauty marketing
            </h2>
            <p className="leading-7 text-slate-600">
              Prompt, format e asset pronti per trasformare i tuoi servizi hair in contenuti più
              moderni e in comunicazioni più semplici da gestire ogni settimana.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.includes.map((item) => (
              <div key={item} className="card-surface p-5">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-pink-500" />
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
              Il kit è già allineato alla piattaforma SaaS
            </h2>
            <p className="leading-7 text-slate-600">
              Oltre al download, puoi testare la demo pubblica e poi passare ai generatori completi
              della dashboard verticale per hair salon e barber shop.
            </p>
          </div>
          <div className="grid gap-4">
            {includedGenerators.map((item) => (
              <div key={item} className="card-surface p-5">
                <p className="font-semibold text-slate-900">{item}</p>
              </div>
            ))}
            <div className="card-surface flex flex-col gap-3 p-5 sm:flex-row">
              <Link href="/demo?vertical=hair" className="button-secondary text-center">
                Prova la demo hair
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
        title="Vuoi usare il kit hair subito oppure testare anche il SaaS?"
        description="Puoi acquistare il pacchetto parrucchieri come prodotto singolo oppure entrare nella piattaforma BizKit AI con generatori, storico e dashboard verticale."
        primaryCta={{ href: `/checkout?product=${product.slug}`, label: "Acquista ora" }}
        secondaryCta={{ href: "/demo?vertical=hair", label: "Prova la demo hair" }}
      />
    </>
  );
}
