import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardIcon } from "@/components/dashboard/DashboardIcon";
import { UsageMeter } from "@/components/dashboard/UsageMeter";
import {
  pickPrimaryBusinessProfile,
  type BusinessProfile,
} from "@/lib/business-profile";
import {
  getBusinessTypeLabel,
  isHairBusinessType,
  isSportsBusinessType,
} from "@/lib/business-verticals";
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

type CalendarsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type CalendarFilter = "all" | "active" | "fitness" | "hair" | "sports";

function getVerticalKey(businessType?: string | null): "fitness" | "hair" | "sports" | "unclassified" {
  if (!businessType) {
    return "unclassified";
  }

  if (isHairBusinessType(businessType)) {
    return "hair";
  }

  if (isSportsBusinessType(businessType)) {
    return "sports";
  }

  return "fitness";
}

function getVerticalBadge(businessType?: string | null) {
  const verticalKey = getVerticalKey(businessType);

  if (verticalKey === "hair") {
    return {
      label: "Hair",
      className: "bg-pink-50 text-pink-700 border border-pink-200",
    };
  }

  if (verticalKey === "sports") {
    return {
      label: "Sports & Outdoor",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
  }

  if (verticalKey === "unclassified") {
    return {
      label: "Non classificato",
      className: "bg-slate-100 text-slate-600 border border-slate-200",
    };
  }

  return {
    label: "Fitness",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  };
}

function getFilterLabel(filter: CalendarFilter, activeBusinessType: string | null) {
  switch (filter) {
    case "active":
      return activeBusinessType ? `Verticale attiva: ${getBusinessTypeLabel(activeBusinessType)}` : "Verticale attiva";
    case "fitness":
      return "Fitness";
    case "hair":
      return "Hair";
    case "sports":
      return "Sports & Outdoor";
    default:
      return "Tutti";
  }
}

function matchesFilter(
  calendar: CalendarRow,
  filter: CalendarFilter,
  activeBusinessType: string | null,
) {
  const verticalKey = getVerticalKey(calendar.business_type);

  switch (filter) {
    case "active":
      return Boolean(activeBusinessType && calendar.business_type === activeBusinessType);
    case "fitness":
      return verticalKey === "fitness";
    case "hair":
      return verticalKey === "hair";
    case "sports":
      return verticalKey === "sports";
    default:
      return true;
  }
}

function renderCalendarCard(calendar: CalendarRow) {
  const badge = getVerticalBadge(calendar.business_type);

  return (
    <article
      key={calendar.id}
      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
              {badge.label}
            </span>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              {calendar.period_days} giorni
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              {calendar.business_type ? getBusinessTypeLabel(calendar.business_type) : "Senza business type"}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-bold text-slate-950">{calendar.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {calendar.calendar_json?.objective || "Obiettivo non disponibile"}
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Creato il {new Date(calendar.created_at).toLocaleString("it-IT")}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(calendar.calendar_json?.entries ?? []).slice(0, 3).map((entry, index) => (
          <div
            key={`${calendar.id}-${index}`}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              {entry.date ?? `Giorno ${index + 1}`}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {entry.title ?? "Contenuto"}
            </p>
            <p className="mt-1 text-xs text-slate-500">{entry.format ?? "Formato"}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-[1.25rem] border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Vuoi tornare ad agire su questo calendario?</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Aprilo nel planner per generare i contenuti completi delle singole righe, copiarli o salvarli.
          </p>
        </div>
        <Link
          href={`/dashboard/social-calendar?calendarId=${calendar.id}`}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Apri nel planner
        </Link>
      </div>
    </article>
  );
}

export default async function CalendarsHistoryPage({ searchParams }: CalendarsPageProps) {
  const { supabase, user } = await requireDashboardUser();
  const params = searchParams ? await searchParams : {};
  const rawFilter = params.filter;
  const filter = (Array.isArray(rawFilter) ? rawFilter[0] : rawFilter) as CalendarFilter | undefined;
  const selectedFilter: CalendarFilter =
    filter && ["all", "active", "fitness", "hair", "sports"].includes(filter) ? filter : "all";

  const [{ data: calendars }, { data: accountProfile }, { data: businessProfiles }] =
    await Promise.all([
      supabase
        .from("content_calendars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle(),
      supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
  const usage = await getPlanUsageSummary(supabase, {
    userId: user.id,
    subscriptionTier: accountProfile?.subscription_tier,
  });

  const rows = (calendars as CalendarRow[] | null) ?? [];
  const activeProfile = pickPrimaryBusinessProfile((businessProfiles as BusinessProfile[] | null) ?? []);
  const activeBusinessType = activeProfile?.business_type ?? null;
  const activeRows = rows.filter((calendar) => activeBusinessType && calendar.business_type === activeBusinessType);
  const otherVerticalRows = rows.filter(
    (calendar) => calendar.business_type && calendar.business_type !== activeBusinessType,
  );
  const unclassifiedRows = rows.filter((calendar) => !calendar.business_type);
  const filteredRows = rows.filter((calendar) => matchesFilter(calendar, selectedFilter, activeBusinessType));
  const filterOptions: CalendarFilter[] = ["all", "active", "fitness", "hair", "sports"];

  return (
    <DashboardShell
      title="Calendari salvati"
      description="Rivedi i piani editoriali generati, separa la verticale attiva dallo storico e recupera le idee migliori senza perdere nulla."
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">History calendari</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              La vista distingue la verticale attiva dallo storico delle altre verticali, senza eliminare nessun calendario.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((item) => {
              const active = selectedFilter === item;
              return (
                <Link
                  key={item}
                  href={`/dashboard/calendars?filter=${item}`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:text-blue-700"
                  }`}
                >
                  {getFilterLabel(item, activeBusinessType)}
                </Link>
              );
            })}
          </div>
        </div>

        {selectedFilter !== "all" ? (
          <div className="mt-5 rounded-[1.5rem] border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-800">
            Filtro attivo: <span className="font-semibold">{getFilterLabel(selectedFilter, activeBusinessType)}</span>
          </div>
        ) : null}

        {rows.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <DashboardIcon name="calendar" className="h-5 w-5" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-950">Nessun calendario ancora generato</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Usa il modulo Social Calendar per creare il primo piano editoriale da 7, 14 o 30 giorni.
            </p>
          </div>
        ) : selectedFilter === "all" ? (
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-950">Calendari della verticale attiva</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeBusinessType
                      ? `Mostro solo i calendari legati a ${getBusinessTypeLabel(activeBusinessType)}.`
                      : "Completa e imposta un business profile primario per classificare la verticale attiva."}
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {activeRows.length} calendari
                </span>
              </div>

              <div className="mt-4 grid gap-4">
                {activeRows.length > 0 ? (
                  activeRows.map((calendar) => renderCalendarCard(calendar))
                ) : (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                    Nessun calendario associato alla verticale attiva per ora.
                  </div>
                )}
              </div>
            </div>

            <details className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 open:bg-white">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">Storico altre verticali</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      I vecchi calendari restano disponibili qui, separati dalla verticale attiva.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    {otherVerticalRows.length} calendari
                  </span>
                </div>
              </summary>

              <div className="mt-4 grid gap-4">
                {otherVerticalRows.length > 0 ? (
                  otherVerticalRows.map((calendar) => renderCalendarCard(calendar))
                ) : (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                    Nessun calendario di altre verticali.
                  </div>
                )}
              </div>
            </details>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-950">Non classificati</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Calendari piu vecchi o incompleti che non hanno ancora un business type valorizzato.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {unclassifiedRows.length} calendari
                </span>
              </div>

              <div className="mt-4 grid gap-4">
                {unclassifiedRows.length > 0 ? (
                  unclassifiedRows.map((calendar) => renderCalendarCard(calendar))
                ) : (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                    Nessun calendario non classificato.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {filteredRows.length > 0 ? (
              filteredRows.map((calendar) => renderCalendarCard(calendar))
            ) : (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Nessun calendario trovato per questo filtro.
              </div>
            )}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
