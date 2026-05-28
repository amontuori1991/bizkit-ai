import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProtectedDownloadButton } from "@/components/ProtectedDownloadButton";
import { PurchaseTracker } from "@/components/PurchaseTracker";
import { gymKitDownloads } from "@/data/downloads";
import { isStripeCheckoutConfigured } from "@/lib/env";
import { getStripeServer, STRIPE_PRODUCT } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pagamento completato",
  description:
    "Conferma acquisto completato per AI Kit per Palestre con accesso protetto al download del kit.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

type SuccessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = searchParams ? await searchParams : {};
  const rawSessionId = params.session_id;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;

  if (!sessionId) {
    redirect("/");
  }

  if (!isStripeCheckoutConfigured()) {
    redirect("/checkout");
  }

  try {
    const stripe = getStripeServer();
    if (!stripe) {
      redirect("/checkout");
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" || session.metadata?.productSlug !== STRIPE_PRODUCT.slug) {
      redirect("/");
    }
  } catch {
    redirect("/");
  }

  return (
    <section className="section-shell pt-10 sm:pt-14">
      <PurchaseTracker
        sessionId={sessionId}
        itemId={STRIPE_PRODUCT.slug}
        itemName={STRIPE_PRODUCT.name}
        category="Fitness"
        price={29}
      />
      <div className="container-shell space-y-8">
        <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(220,252,231,0.84)_28%,_rgba(15,23,42,0.04)_100%)] p-8 shadow-soft sm:p-10">
          <span className="eyebrow border-emerald-200 bg-emerald-50 text-emerald-700">
            Pagamento verificato
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Il tuo kit e pronto per il download
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Il pagamento e stato confermato da Stripe e l&apos;accesso al file ZIP e stato
            sbloccato per questa sessione. Puoi avviare il download in modo sicuro dal pulsante qui
            sotto.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
              <p className="text-sm text-slate-500">Prodotto</p>
              <p className="mt-2 font-semibold text-slate-950">{STRIPE_PRODUCT.name}</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
              <p className="text-sm text-slate-500">Importo pagato</p>
              <p className="mt-2 font-semibold text-slate-950">29 EUR</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
              <p className="text-sm text-slate-500">Supporto</p>
              <p className="mt-2 font-semibold text-slate-950">hello@bizkitai.it</p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-emerald-200 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Download protetto
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Accesso sicuro al pacchetto completo
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Il link diretto al file ZIP e nascosto. Il download passa dall&apos;endpoint
                  protetto, che verifica sessione Stripe, pagamento riuscito e richiesta dallo
                  stesso dominio.
                </p>
              </div>
              <ProtectedDownloadButton sessionId={sessionId} />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                Contenuti inclusi
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Cosa troverai dentro il kit
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              {gymKitDownloads.length} risorse premium
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {gymKitDownloads.map((file) => (
              <div
                key={file.id}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-950">{file.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{file.fileName}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{file.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {file.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Prossimo step
          </p>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Se vuoi trasformare il kit in un flusso continuativo, puoi anche passare alla
            piattaforma SaaS BizKit AI con dashboard, generatori AI e CRM dedicato al fitness.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="button-primary">
              Prova la piattaforma
            </Link>
            <Link href="/prodotto/ai-kit-per-palestre" className="button-secondary">
              Torna al prodotto
            </Link>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Supporto:{" "}
            <a href="mailto:hello@bizkitai.it" className="font-semibold text-blue-700">
              hello@bizkitai.it
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
