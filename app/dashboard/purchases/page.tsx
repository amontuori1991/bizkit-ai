import Link from "next/link";
import { ProtectedDownloadButton } from "@/components/ProtectedDownloadButton";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardIcon } from "@/components/dashboard/DashboardIcon";
import { getDownloadsByProductSlug } from "@/data/downloads";
import { products } from "@/data/products";
import { getOwnedDigitalDownloads } from "@/lib/digital-purchases";
import { requireDashboardUser } from "@/lib/saas";

export default async function PurchasesPage() {
  const { user } = await requireDashboardUser();
  const purchases = await getOwnedDigitalDownloads(user.id);

  return (
    <DashboardShell
      title="I miei acquisti"
      description="Ritrova tutti i kit digitali acquistati e scaricali di nuovo in qualsiasi momento dal tuo account."
      userEmail={user.email ?? "utente"}
    >
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Download disponibili</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ogni acquisto collegato al tuo account resta disponibile per un nuovo download dal catalogo o da questa area.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {purchases.length} kit
          </span>
        </div>

        {purchases.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <DashboardIcon name="history" className="h-5 w-5" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-950">Nessun kit collegato al tuo account</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Dopo l&apos;acquisto il kit viene mostrato qui e anche nel catalogo con il badge Acquistato.
            </p>
            <div className="mt-5">
              <Link href="/catalogo" className="button-primary">
                Vai al catalogo
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {purchases.map((purchase) => {
              const product = products.find((item) => item.slug === purchase.product_slug);
              const bundle = getDownloadsByProductSlug(purchase.product_slug);

              if (!product || !bundle) {
                return null;
              }

              return (
                <article
                  key={purchase.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Acquistato
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-bold text-slate-950">{product.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{product.shortDescription}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      <p>Collegato il {new Date(purchase.created_at).toLocaleString("it-IT")}</p>
                      <p className="mt-1">
                        Download effettuati: <span className="font-semibold text-slate-700">{purchase.download_count}</span>
                      </p>
                      {purchase.last_downloaded_at ? (
                        <p className="mt-1">
                          Ultimo download:{" "}
                          <span className="font-semibold text-slate-700">
                            {new Date(purchase.last_downloaded_at).toLocaleString("it-IT")}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <ProtectedDownloadButton
                      productSlug={product.slug}
                      productName={product.name}
                      assetName={bundle.zipFileName}
                      buttonLabel="Scarica di nuovo"
                    />
                    <Link href={`/prodotto/${product.slug}`} className="button-secondary w-full sm:w-auto">
                      Vedi dettagli
                    </Link>
                    {product.demoHref ? (
                      <Link href={product.demoHref} className="button-secondary w-full sm:w-auto">
                        Prova demo
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
