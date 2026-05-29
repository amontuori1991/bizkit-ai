import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardIcon } from "@/components/dashboard/DashboardIcon";
import { UsageMeter } from "@/components/dashboard/UsageMeter";
import { getPlanUsageSummary } from "@/lib/plan-limits";
import { requireDashboardUser } from "@/lib/saas";

export default async function HistoryPage() {
  const { supabase, user } = await requireDashboardUser();
  const [{ data: generatedContents }, { data: savedContents }, { data: accountProfile }] = await Promise.all([
    supabase
      .from("generated_contents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("saved_contents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle(),
  ]);
  const usage = await getPlanUsageSummary(supabase, {
    userId: user.id,
    subscriptionTier: accountProfile?.subscription_tier,
  });

  return (
    <DashboardShell
      title="Cronologia e contenuti salvati"
      description="Rivedi tutte le generazioni AI recenti e conserva le versioni migliori nella tua libreria personale."
      userEmail={user.email ?? "utente"}
    >
      <div className="mb-6">
        <UsageMeter
          title="Contenuti salvati"
          progress={usage.progress.savedContents}
          helper="La libreria cresce con ogni contenuto che decidi di tenere."
          accent="blue"
          upgradeLabel={usage.limits.nextUpgrade?.toUpperCase() ?? null}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Generazioni recenti</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tutte le uscite grezze del composer AI, utili per iterare o recuperare idee.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {(generatedContents ?? []).length} elementi
            </span>
          </div>
          <div className="mt-5 grid gap-4">
            {(generatedContents ?? []).length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <DashboardIcon name="history" className="h-5 w-5" />
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-950">Nessuna generazione ancora registrata</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Fai la prima generazione da Caption AI, Reel AI o Promo AI per popolare questa area.
                </p>
              </div>
            ) : (
              generatedContents?.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        {item.type}
                      </span>
                      {item.is_saved ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Salvato
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString("it-IT")}
                    </p>
                  </div>
                  <p className="mt-4 line-clamp-6 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {item.output_text}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Libreria salvata</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Le tue versioni riutilizzabili, organizzate per uso operativo e pubblicazione.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {(savedContents ?? []).length} asset
            </span>
          </div>
          <div className="mt-5 grid gap-4">
            {(savedContents ?? []).length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <DashboardIcon name="save" className="h-5 w-5" />
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-950">Nessun contenuto salvato ancora</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Salva le varianti migliori dai generatori per costruire una libreria pronta da riusare.
                </p>
              </div>
            ) : (
              savedContents?.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{item.type}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString("it-IT")}
                    </p>
                  </div>
                  <p className="mt-4 line-clamp-6 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {item.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
