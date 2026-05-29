import type { Metadata } from "next";
import Link from "next/link";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Pagamento annullato",
  description:
    "Il pagamento del kit digitale e stato annullato. Torna al prodotto per riprovare il checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

type CancelPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CancelPage({ searchParams }: CancelPageProps) {
  const params = searchParams ? await searchParams : {};
  const rawProduct = params.product;
  const productSlug = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;
  const product = products.find((item) => item.slug === productSlug);

  return (
    <section className="section-shell pt-12 sm:pt-16">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft sm:p-12">
          <span className="eyebrow border-amber-200 bg-amber-50 text-amber-700">
            Pagamento annullato
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Nessun addebito e stato completato
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Hai interrotto il checkout prima della conferma. Puoi tornare alla pagina prodotto e
            riprovare quando vuoi.
          </p>
          <Link href={`/prodotto/${product?.slug ?? "ai-kit-per-palestre"}`} className="button-primary mt-8">
            Torna al prodotto
          </Link>
        </div>
      </div>
    </section>
  );
}
