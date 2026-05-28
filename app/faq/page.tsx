import type { Metadata } from "next";
import { FAQAccordion } from "@/components/FAQAccordion";
import { faqs } from "@/data/products";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Leggi le domande frequenti su BizKit AI, sulla piattaforma SaaS, sui kit digitali e sul billing Stripe.",
};

export default function FAQPage() {
  return (
    <section className="section-shell pt-12 sm:pt-16">
      <div className="container-shell">
        <div className="max-w-3xl space-y-5">
          <span className="eyebrow">FAQ</span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Tutto quello che serve per capire la piattaforma
          </h1>
          <p className="text-lg leading-8 text-slate-600">
            Una raccolta di risposte chiare per spiegare come funzionano SaaS, kit digitali,
            billing ricorrente e flussi di acquisto.
          </p>
        </div>
        <div className="mt-10">
          <FAQAccordion items={faqs} />
        </div>
      </div>
    </section>
  );
}
