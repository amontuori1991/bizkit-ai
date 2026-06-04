import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { getOwnedDigitalProductSlugs } from "@/lib/digital-purchases";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Catalogo",
  description:
    "Esplora il catalogo BizKit AI con kit digitali e verticali pronti da collegare alla piattaforma SaaS per palestre e attivita locali.",
};

export default async function CatalogPage() {
  let ownedSlugs = new Set<string>();

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        ownedSlugs = new Set(await getOwnedDigitalProductSlugs(user.id));
      }
    }
  }

  return (
    <>
      <section className="section-shell pt-12 sm:pt-16">
        <div className="container-shell space-y-5">
          <span className="eyebrow">Catalogo prodotti</span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Kit e verticali pensati per nicchie specifiche
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">
            I kit per palestre, parrucchieri e centri sportivi/outdoor sono gia disponibili. Le
            prossime nicchie hanno una struttura pronta, cosi puoi ampliare il catalogo e
            trasformarlo in nuovi moduli o offerte per il SaaS.
          </p>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              isPurchased={ownedSlugs.has(product.slug)}
            />
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
