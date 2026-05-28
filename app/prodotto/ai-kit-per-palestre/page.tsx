import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PricingBox } from "@/components/PricingBox";
import { ProductViewTracker } from "@/components/ProductViewTracker";
import { faqs, products } from "@/data/products";

export const metadata: Metadata = {
  title: "AI Kit per Palestre",
  description:
    "Acquista AI Kit per Palestre a 29 EUR con Stripe Checkout: prompt, calendario editoriale, idee Reel, caption, template WhatsApp e fogli gestione clienti.",
};

export default function ProductGymPage() {
  const product = products.find((item) => item.slug === "ai-kit-per-palestre");

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
            <span className="eyebrow">{product.category}</span>
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
                  Palestre, personal trainer e centri fitness che vogliono comunicare meglio e
                  lavorare con piu continuita.
                </p>
              </div>
              <div className="card-surface p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Consegna
                </p>
                <p className="mt-3 leading-7 text-slate-700">
                  Accesso immediato dopo il pagamento alla pagina di conferma con download del kit
                  completo.
                </p>
              </div>
            </div>
          </div>
          <PricingBox
            name={product.name}
            price={product.price}
            features={product.includes}
            cta={{ href: `/checkout?product=${product.slug}`, label: "Acquista ora" }}
            note="Pagamento gestito con Stripe Checkout e accesso immediato alla conferma acquisto."
          />
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <span className="eyebrow">Cosa include</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Un pacchetto operativo gia organizzato
            </h2>
            <p className="leading-7 text-slate-600">
              Ogni elemento del kit e pensato per aiutarti a produrre contenuti, semplificare la
              comunicazione e rendere piu ordinata la gestione commerciale.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.includes.map((item) => (
              <div key={item} className="card-surface p-5">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-blue-600" />
                  <p className="font-semibold text-slate-900">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell grid gap-6 md:grid-cols-3">
          <div className="card-surface p-6">
            <h3 className="text-xl font-semibold text-slate-950">Contenuti social</h3>
            <p className="mt-3 leading-7 text-slate-600">
              Prompt, caption e idee Reel per pubblicare con piu costanza e meno fatica.
            </p>
          </div>
          <div className="card-surface p-6">
            <h3 className="text-xl font-semibold text-slate-950">Gestione clienti</h3>
            <p className="mt-3 leading-7 text-slate-600">
              Fogli e template che aiutano a seguire prospect, abbonamenti e messaggi ricorrenti.
            </p>
          </div>
          <div className="card-surface p-6">
            <h3 className="text-xl font-semibold text-slate-950">Promozioni pronte</h3>
            <p className="mt-3 leading-7 text-slate-600">
              Offerte e comunicazioni immediate da adattare alle campagne e agli open day.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="container-shell">
          <div className="mb-8 space-y-3">
            <span className="eyebrow">FAQ prodotto</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Dettagli utili prima del checkout
            </h2>
          </div>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <CTASection
        title="Vuoi completare l'acquisto del kit oppure passare al SaaS?"
        description="Puoi acquistare il kit fitness come risorsa singola oppure usare BizKit AI in modalita subscription con dashboard e generatori dedicati."
        primaryCta={{ href: `/checkout?product=${product.slug}`, label: "Acquista ora" }}
        secondaryCta={{ href: "/signup", label: "Prova la piattaforma" }}
      />
    </>
  );
}
