import type { Metadata } from "next";
import Link from "next/link";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { products } from "@/data/products";
import { isStripeCheckoutConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Completa l'acquisto di AI Kit per Palestre con Stripe Checkout in modo semplice e sicuro.",
  robots: {
    index: false,
    follow: false,
  },
};

type CheckoutPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = searchParams ? await searchParams : {};
  const rawProduct = params.product;
  const productSlug = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;
  const product =
    products.find((item) => item.slug === productSlug) ??
    products.find((item) => item.status === "available") ??
    products[0];
  const stripeConfigured = isStripeCheckoutConfigured();

  return (
    <section className="section-shell pt-12 sm:pt-16">
      <div className="container-shell grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="card-surface p-6 sm:p-8">
          <span className="eyebrow">Checkout sicuro con Stripe</span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Completa l&apos;acquisto in pochi secondi
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Verrai reindirizzato a Stripe Checkout per pagare in modo sicuro. Dopo il pagamento
            tornerai automaticamente alla pagina di conferma con accesso immediato al kit.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Prodotto</p>
              <p className="mt-2 font-semibold text-slate-950">{product.name}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Prezzo</p>
              <p className="mt-2 font-semibold text-slate-950">{product.price}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Consegna</p>
              <p className="mt-2 font-semibold text-slate-950">Accesso immediato</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm leading-7 text-slate-700">
            Stripe gestisce il pagamento su una pagina ospitata. BizKit AI non salva carte o
            dati di pagamento sul progetto.
          </div>
          {!stripeConfigured ? (
            <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-700">
              Stripe non e ancora configurato. Il checkout reale resta disattivato finche non
              imposti chiavi pubbliche e segrete.
            </div>
          ) : null}

          <div className="mt-8 max-w-md">
            <StripeCheckoutButton
              productSlug={product.slug}
              productName={product.name}
              category={product.category}
              price={29}
              disabled={!stripeConfigured}
              disabledMessage="Configura NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY e STRIPE_SECRET_KEY per attivare il checkout."
            />
          </div>

          <div className="mt-4">
            <Link href="/prodotto/ai-kit-per-palestre" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              Torna al prodotto
            </Link>
          </div>
        </div>

        <aside className="card-surface p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Riepilogo ordine
          </p>
          <h2 className="mt-4 text-2xl font-bold text-slate-950">{product.name}</h2>
          <p className="mt-3 leading-7 text-slate-600">{product.shortDescription}</p>
          <div className="mt-6 rounded-3xl bg-slate-900 p-6 text-white">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">Prezzo finale</p>
                <p className="mt-2 text-4xl font-bold">{product.price}</p>
              </div>
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white">
                Stripe
              </span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {product.includes.slice(0, 5).map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
