import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { isAdminAuthenticated } from "@/lib/admin";
import { getAdminAnalyticsData } from "@/lib/admin-analytics";

export const metadata: Metadata = {
  title: "Admin Analytics",
  description: "Analytics interne BizKit AI: utenti, attivita, crediti AI e conversione piani.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

function maxCount(values: Array<{ count: number }>) {
  return values.reduce((max, item) => Math.max(max, item.count), 1);
}

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    redirect("/admin/login");
  }

  const analytics = await getAdminAnalyticsData();
  const dailyMax = maxCount(analytics.dailyGenerations);
  const businessMax = maxCount(analytics.businessTypes);
  const creditsMax = analytics.creditUsageByPlan.reduce(
    (max, item) => Math.max(max, item.creditsUsed),
    1,
  );

  return (
    <>
      <div className="absolute right-4 top-4 z-40 sm:right-8 sm:top-6">
        <AdminLogoutButton />
      </div>
      <section className="section-shell pt-12 sm:pt-16">
        <div className="container-shell space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="eyebrow">Admin Analytics</span>
                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  Metriche interne BizKit AI
                </h1>
                <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                  Vista centralizzata su registrazioni, attivita recente, utilizzo AI, business type
                  piu diffusi e segnali di conversione verso i piani paid.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/admin" className="button-secondary">
                  Torna alla dashboard
                </Link>
                <Link href="/admin/users" className="button-secondary">
                  Gestione utenti
                </Link>
                <Link href="/admin/setup" className="button-secondary">
                  Verifica setup
                </Link>
              </div>
            </div>

            {!analytics.configured ? (
              <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-700">
                Supabase service role non configurato. Per popolare questa pagina imposta
                `SUPABASE_SERVICE_ROLE_KEY` e conferma che il progetto punti al database corretto.
              </div>
            ) : null}

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  label: "Utenti registrati",
                  value: analytics.summary.registeredUsers,
                  helper: "Totale profili creati",
                },
                {
                  label: "Attivi ultimi 7 giorni",
                  value: analytics.summary.activeUsers7d,
                  helper: "Utenti con richieste AI riuscite",
                },
                {
                  label: "Calendari generati",
                  value: analytics.summary.calendarsGenerated,
                  helper: "Totale content_calendars",
                },
                {
                  label: "Contenuti salvati",
                  value: analytics.summary.savedContents,
                  helper: "Totale saved_contents",
                },
                {
                  label: "Conversazioni Coach",
                  value: analytics.summary.assistantConversations,
                  helper: "Totale assistant_conversations",
                },
                {
                  label: "Messaggi Coach",
                  value: analytics.summary.assistantMessages,
                  helper: "Totale assistant_messages",
                },
                {
                  label: "Utenti paid",
                  value: analytics.summary.upgradedUsers,
                  helper: `${analytics.summary.freeToPaidConversionRate}% conversione free -> paid`,
                },
                {
                  label: "Utenti Starter / Pro / Agency",
                  value: `${analytics.summary.starterUsers} / ${analytics.summary.proUsers} / ${analytics.summary.agencyUsers}`,
                  helper: "Distribuzione reale dei piani paid",
                },
                {
                  label: "Business type top",
                  value: analytics.topBusinessType?.label ?? "N/D",
                  helper: analytics.topBusinessType
                    ? `${analytics.topBusinessType.count} profili`
                    : "Nessun business profile",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">Generazioni AI per giorno</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Conteggio richieste AI riuscite negli ultimi 7 giorni.
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Ultimi 7 giorni
                </span>
              </div>
              <div className="mt-6 grid gap-4">
                {analytics.dailyGenerations.map((point) => (
                  <div key={point.date} className="grid gap-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-700">
                        {new Date(point.date).toLocaleDateString("it-IT", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                      <span className="font-semibold text-slate-950">{point.count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                        style={{ width: `${Math.max(8, (point.count / dailyMax) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">Business type più usato</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Distribuzione dei profili business salvati in piattaforma.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                {analytics.businessTypes.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                    Nessun business profile registrato per ora.
                  </div>
                ) : (
                  analytics.businessTypes.map((item) => (
                    <div key={item.label} className="grid gap-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="font-semibold text-slate-950">{item.count}</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500"
                          style={{ width: `${Math.max(8, (item.count / businessMax) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">Utilizzo crediti per piano</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Crediti AI consumati e token aggregati dai piani presenti in `ai_usage_daily`.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                {analytics.creditUsageByPlan.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                    Nessun dato utilizzo disponibile per ora.
                  </div>
                ) : (
                  analytics.creditUsageByPlan.map((item) => (
                    <div key={item.planId} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {item.planId}
                          </p>
                          <p className="mt-2 text-2xl font-bold text-slate-950">
                            {item.creditsUsed} crediti
                          </p>
                        </div>
                        <p className="text-sm text-slate-500">{item.totalTokens} token</p>
                      </div>
                      <div className="mt-4 h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-lime-500"
                          style={{ width: `${Math.max(8, (item.creditsUsed / creditsMax) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-2xl font-bold text-slate-950">Lettura rapida del funnel</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Base utenti</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    {analytics.summary.registeredUsers}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Profili registrati complessivi letti da `profiles`
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Upgrade a paid</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    {analytics.summary.freeToPaidConversionRate}%
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Utenti non-free rispetto al totale registrato
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Attivazione prodotto</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    {analytics.summary.activeUsers7d}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Utenti con attivita AI riuscita negli ultimi 7 giorni
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Asset creati</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    {analytics.summary.savedContents + analytics.summary.calendarsGenerated}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Somma di contenuti salvati e calendari generati
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Utilizzo medio crediti</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    {analytics.summary.averageCreditsUsed}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Media crediti AI per utente con attivita
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Utilizzo medio storage</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    {analytics.summary.averageStorageUsed}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Media contenuti salvati per utente attivo
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Utilizzo medio calendari</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    {analytics.summary.averageCalendarsUsed}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Media calendari salvati per utente che usa il planner
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
