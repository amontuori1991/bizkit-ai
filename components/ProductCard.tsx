import { ProtectedDownloadButton } from "@/components/ProtectedDownloadButton";
import Link from "next/link";
import type { Product } from "@/data/products";
import { getDownloadsByProductSlug } from "@/data/downloads";

type ProductCardProps = {
  product: Product;
  isPurchased?: boolean;
};

export function ProductCard({ product, isPurchased = false }: ProductCardProps) {
  const isAvailable = product.status === "available";
  const downloadBundle = isPurchased ? getDownloadsByProductSlug(product.slug) : null;

  return (
    <article className="card-surface flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {product.category}
          </p>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            {product.name}
          </h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isPurchased
              ? "bg-emerald-100 text-emerald-700"
              : isAvailable
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {isPurchased ? "Acquistato" : isAvailable ? "Disponibile" : "In arrivo"}
        </span>
      </div>
      <p className="mt-4 flex-1 leading-7 text-slate-600">{product.shortDescription}</p>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Prezzo</p>
            <p className="text-3xl font-bold text-slate-950">{product.price}</p>
          </div>
          <Link
            href={isAvailable ? `/prodotto/${product.slug}` : "/contatti"}
            className={isAvailable ? "button-primary" : "button-secondary"}
          >
            {isAvailable ? "Dettagli" : "Richiedi"}
          </Link>
        </div>
        {isAvailable ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            {isPurchased && downloadBundle ? (
              <ProtectedDownloadButton
                productSlug={product.slug}
                productName={product.name}
                assetName={downloadBundle.zipFileName}
                buttonLabel="Scarica di nuovo"
              />
            ) : (
              <Link href={`/checkout?product=${product.slug}`} className="button-secondary w-full sm:w-auto">
                Acquista
              </Link>
            )}
            {product.demoHref ? (
              <Link href={product.demoHref} className="button-secondary w-full sm:w-auto">
                Prova demo
              </Link>
            ) : null}
            {isPurchased ? (
              <Link href="/dashboard/purchases" className="button-secondary w-full sm:w-auto">
                I miei acquisti
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
