import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Catalogo",
  description:
    "Esplora il catalogo BizKit AI con kit digitali e verticali pronti da collegare alla piattaforma SaaS per palestre e attivita locali.",
};

export default function CatalogPage() {
  return (
    <>
      <section className="section-shell pt-12 sm:pt-16">
        <div className="container-shell space-y-5">
          <span className="eyebrow">Catalogo prodotti</span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Kit e verticali pensati per nicchie specifiche
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">
            Il primo kit e disponibile ora. Le prossime nicchie hanno gia una struttura pronta,
            cosi puoi ampliare il catalogo e trasformarlo in nuovi moduli o offerte per il SaaS.
          </p>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <CTASection
        title="Vuoi lanciare una nuova nicchia?"
        description="La struttura dati e gia pronta per aggiungere altri kit, nuovi verticali SaaS e varianti di prezzo."
        primaryCta={{ href: "/contatti", label: "Richiedi una nicchia" }}
        secondaryCta={{ href: "/signup", label: "Vedi la piattaforma" }}
      />
    </>
  );
}
