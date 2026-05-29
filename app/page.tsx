import type { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ProductCard } from "@/components/ProductCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { plans } from "@/data/plans";
import { faqs, products } from "@/data/products";

export const metadata: Metadata = {
  title: "Home",
  description:
    "BizKit AI e la piattaforma SaaS per palestre e parrucchieri che vogliono creare caption, Reel, promozioni e gestire clienti con l'AI in un unico workspace.",
  alternates: {
    canonical: "/",
  },
};

const workflowSteps = [
  {
    title: "Attiva il tuo workspace",
    description:
      "Registrati, scegli un piano e accedi a una dashboard pensata per business locali come palestre e saloni parrucchieri.",
  },
  {
    title: "Genera contenuti e promo",
    description:
      "Crea caption, Reel e offerte commerciali con strumenti AI costruiti per fitness e verticali hair/beauty.",
  },
  {
    title: "Salva, organizza e ripeti",
    description:
      "Tieni traccia delle generazioni migliori, gestisci clienti nel CRM e costruisci un flusso operativo piu costante.",
  },
];

const workspaceFeatures = [
  {
    title: "Caption AI",
    description:
      "Scrive caption Instagram piu veloci, coerenti e pronte per CTA, promo e community.",
  },
  {
    title: "Reel AI",
    description:
      "Genera hook, format e script brevi per contenuti video piu frequenti e piu chiari.",
  },
  {
    title: "Promo AI",
    description:
      "Crea campagne per open day, prova gratuita, rinnovi, abbonamenti e personal training.",
  },
  {
    title: "CRM leggero",
    description:
      "Gestisci lead e clienti dentro il prodotto, senza strumenti esterni per partire.",
  },
  {
    title: "Verticale Hair",
    description:
      "Generatori specializzati per saloni parrucchieri, barber shop e hair stylist con CTA orientate a booking.",
  },
];

const outcomes = [
  "Riduci il tempo necessario per contenuti e promozioni settimanali",
  "Dai continuita al marketing anche senza un team interno strutturato",
  "Conservi storico, contenuti salvati e clienti in un unico workspace",
  "Affianchi al SaaS un kit digitale pronto per il lavoro operativo",
];

export default function HomePage() {
  return (
    <>
      <section className="section-shell pt-12 sm:pt-20">
        <div className="container-shell">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <span className="eyebrow">AI workspace per palestre, parrucchieri e business locali</span>
              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Trasforma contenuti, promozioni e gestione clienti in un workflow AI semplice.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  BizKit AI unisce generatori AI, dashboard operativa, CRM leggero e libreria
                  contenuti in una piattaforma pensata per palestre, personal trainer, saloni
                  parrucchieri e barber shop.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="button-primary">
                  Inizia gratis
                </Link>
                <Link href="/demo" className="button-secondary">
                  Prova la demo
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {["Starter, Pro, Agency", "Demo gratuita 1 generazione", "OpenAI + Supabase + Stripe"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 text-sm font-medium text-slate-700 backdrop-blur"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="card-surface overflow-hidden p-6 sm:p-8">
              <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Workspace preview</span>
                  <span>BizKit AI SaaS</span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-300">Generazioni attive</p>
                    <p className="mt-2 text-3xl font-semibold">Caption, Reel, promo e CRM</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">Pricing</p>
                      <p className="mt-2 text-2xl font-bold text-white">da 29 EUR/mese</p>
                    </div>
                    <div className="rounded-2xl bg-blue-600 p-4">
                      <p className="text-sm text-blue-100">Demo</p>
                      <p className="mt-2 font-semibold">1 generazione free senza login</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="text-sm text-slate-300">Posizionamento</p>
                    <p className="mt-2 text-slate-100">
                      Una base SaaS verticale, con kit digitali e billing subscription gia pronti
                      per crescere in nuove nicchie.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <span className="eyebrow">Come funziona</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Un workflow chiaro dalla prima generazione alla gestione clienti
              </h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="card-surface p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell">
          <div className="mb-10 space-y-3">
            <span className="eyebrow">Cosa puoi fare</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              I moduli principali della piattaforma
            </h2>
            <p className="max-w-3xl leading-7 text-slate-600">
              Il primo vertical e dedicato al fitness, ma la struttura e gia pronta per estendere
              la piattaforma a ristoranti, saloni, beauty, real estate e hospitality.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {workspaceFeatures.map((feature) => (
              <div key={feature.title} className="card-surface p-6">
                <h3 className="text-xl font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <div className="mb-10 space-y-3">
            <span className="eyebrow">Verticali attive</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Perfetto per palestre e saloni parrucchieri
            </h2>
            <p className="max-w-3xl leading-7 text-slate-600">
              La piattaforma ora supporta due flussi reali: fitness e hair/beauty. Ogni verticale
              ha generatori, tone of voice, template rapidi e Business Profile intelligente.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card-surface p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Fitness</p>
              <h3 className="mt-4 text-2xl font-bold text-slate-950">Palestre e personal trainer</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Caption, Reel, promo e CRM orientati a prove gratuite, open day, rinnovi e recupero clienti inattivi.
              </p>
            </div>
            <div className="card-surface p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-600">Hair & Beauty</p>
              <h3 className="mt-4 text-2xl font-bold text-slate-950">Saloni parrucchieri e barber shop</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Caption Instagram, Reel, TikTok hook, promo colore/taglio e messaggi clienti orientati a booking e fidelizzazione.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card-surface p-8">
            <span className="eyebrow">Perche adesso</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Dal singolo download a un ricavo ricorrente
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              BizKit AI puo continuare a vendere il kit fitness come offerta low-ticket, mentre il
              cuore del business diventa una piattaforma subscription con accesso continuo agli
              strumenti AI.
            </p>
          </div>
          <div className="grid gap-4">
            {outcomes.map((item) => (
              <div key={item} className="card-surface flex items-start gap-4 p-5">
                <div className="mt-1 h-3 w-3 rounded-full bg-blue-600" />
                <p className="font-medium leading-7 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <span className="eyebrow">Abbonamenti</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Piani pronti per Stripe subscriptions
              </h2>
            </div>
            <Link href="/pricing" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              Apri pricing
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="card-surface p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                  {plan.name}
                </p>
                <p className="mt-4 text-4xl font-bold text-slate-950">{plan.priceLabel}</p>
                <p className="mt-2 text-sm text-slate-500">{plan.seats}</p>
                <p className="mt-4 leading-7 text-slate-600">{plan.description}</p>
                <div className="mt-5 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <span className="eyebrow">Digital products</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Kit e verticali gia pronti per supportare il SaaS
              </h2>
            </div>
            <Link href="/catalogo" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              Apri il catalogo
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {products.filter((product) => product.status === "available").slice(0, 3).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell">
          <div className="mb-10 space-y-3">
            <span className="eyebrow">Testimonianze</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Commenti realistici per il posizionamento SaaS
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <TestimonialCard
              name="Marco"
              role="Titolare palestra boutique"
              quote="Finalmente abbiamo uno spazio unico per idee contenuto, promo e clienti senza passare da fogli sparsi e chat."
            />
            <TestimonialCard
              name="Elena"
              role="Marketing manager fitness studio"
              quote="Il generatore Reel ci aiuta a trasformare velocemente le promo in contenuti brevi che il team riesce davvero a pubblicare."
            />
            <TestimonialCard
              name="Davide"
              role="Consulente growth per palestre"
              quote="La combinazione tra SaaS e kit digitali crea un'offerta piu credibile e molto piu facile da scalare."
            />
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell">
          <div className="mb-10 space-y-3">
            <span className="eyebrow">FAQ</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Domande utili sul nuovo modello BizKit AI
            </h2>
          </div>
          <FAQAccordion items={faqs.slice(0, 4)} />
        </div>
      </section>

      <CTASection
        title="Vuoi vedere BizKit AI come piattaforma SaaS?"
        description="Registrazione, dashboard premium, generatori AI con 3 varianti, demo gratuita e billing subscription sono gia collegati in una base pronta da far crescere."
        primaryCta={{ href: "/signup", label: "Crea il tuo account" }}
        secondaryCta={{ href: "/pricing", label: "Esplora i piani" }}
      />
    </>
  );
}
