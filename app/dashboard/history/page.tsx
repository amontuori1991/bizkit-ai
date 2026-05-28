import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireDashboardUser } from "@/lib/saas";

export default async function HistoryPage() {
  const { supabase, user } = await requireDashboardUser();
  const [{ data: generatedContents }, { data: savedContents }] = await Promise.all([
    supabase
      .from("generated_contents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("saved_contents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <DashboardShell
      title="Cronologia e contenuti salvati"
      description="Consulta tutte le generazioni AI recenti e la tua libreria di contenuti riutilizzabili."
      userEmail={user.email ?? "utente"}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">Generazioni recenti</h2>
          <div className="mt-5 grid gap-4">
            {(generatedContents ?? []).length === 0 ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                Nessuna generazione ancora registrata.
              </div>
            ) : (
              generatedContents?.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-slate-950">{item.type}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString("it-IT")}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.output_text}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">Libreria salvata</h2>
          <div className="mt-5 grid gap-4">
            {(savedContents ?? []).length === 0 ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                Nessun contenuto salvato ancora.
              </div>
            ) : (
              savedContents?.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-slate-950">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString("it-IT")}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.type}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
