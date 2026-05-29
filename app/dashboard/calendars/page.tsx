import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardIcon } from "@/components/dashboard/DashboardIcon";
import { UsageMeter } from "@/components/dashboard/UsageMeter";
import { getPlanUsageSummary } from "@/lib/plan-limits";
import { requireDashboardUser } from "@/lib/saas";

type CalendarRow = {
  id: string;
  title: string;
  business_type: string | null;
  period_days: number;
  calendar_json: {
    objective?: string;
    entries?: Array<{ title?: string; format?: string; date?: string }>;
  } | null;
  created_at: string;
};

export default async function CalendarsHistoryPage() {
  const { supabase, user } = await requireDashboardUser();
  const [{ data: calendars }, { data: accountProfile }] = await Promise.all([
    supabase
      .from("content_calendars")
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

  const rows = (calendars as CalendarRow[] | null) ?? [];

  return (
    <DashboardShell
      title="Calendari salvati"
      description="Rivedi i piani editoriali generati, confronta periodi e recupera le idee migliori già organizzate per giorno."
      userEmail={user.email ?? "utente"}
    >
      <div className="mb-6">
        <UsageMeter
          title="Calendari salvati"
          progress={usage.progress.calendars}
          helper="Ogni calendario resta disponibile in history per riuso e iterazioni future."
          accent="emerald"
          upgradeLabel={usage.limits.nextUpgrade?.toUpperCase() ?? null}
        />
      </div>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">History calendari</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ogni calendario viene salvato con business type, periodo e JSON completo delle righe generate.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {rows.length} calendari
          </span>
        </div>

        <div className="mt-6 grid gap-4">
          {rows.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <DashboardIcon name="calendar" className="h-5 w-5" />
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-950">Nessun calendario ancora generato</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Usa il modulo Social Calendar per creare il primo piano editoriale da 7, 14 o 30 giorni.
              </p>
            </div>
          ) : (
            rows.map((calendar) => (
              <article key={calendar.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">{calendar.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {calendar.calendar_json?.objective || "Obiettivo non disponibile"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      {calendar.period_days} giorni
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {calendar.business_type ?? "business"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {(calendar.calendar_json?.entries ?? []).slice(0, 3).map((entry, index) => (
                    <div key={`${calendar.id}-${index}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {entry.date ?? `Giorno ${index + 1}`}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{entry.title ?? "Contenuto"}</p>
                      <p className="mt-1 text-xs text-slate-500">{entry.format ?? "Formato"}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Creato il {new Date(calendar.created_at).toLocaleString("it-IT")}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
