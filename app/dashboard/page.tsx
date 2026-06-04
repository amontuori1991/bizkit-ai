import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardIcon } from "@/components/dashboard/DashboardIcon";
import { UsageMeter } from "@/components/dashboard/UsageMeter";
import { isBusinessProfileComplete, type BusinessProfile } from "@/lib/business-profile";
import { getPlanUsageSummary, normalizePlanId } from "@/lib/plan-limits";
import { requireDashboardUser } from "@/lib/saas";

export default async function DashboardPage() {
  const { supabase, user } = await requireDashboardUser();
  const [
    { data: profile },
    { data: businessProfiles },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  const usage = await getPlanUsageSummary(supabase, {
    userId: user.id,
    subscriptionTier: profile?.subscription_tier,
  });
  const aiPlan = normalizePlanId(profile?.subscription_tier);
  const businessReady = isBusinessProfileComplete(
    ((businessProfiles as BusinessProfile[] | null) ?? []).find((item) => item.is_primary) ??
      ((businessProfiles as BusinessProfile[] | null) ?? [])[0] ??
      null,
  );
  const firstName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "team";
  const checklist = [
    {
      label: "Completa il Business Profile",
      done: businessReady,
      href: "/dashboard/settings/business-profile",
    },
    {
      label: "Genera il primo contenuto AI",
      done: usage.counts.generatedContents > 0,
      href: "/dashboard/caption",
    },
    {
      label: "Salva un asset nella libreria",
      done: usage.counts.savedContents > 0,
      href: "/dashboard/history",
    },
    {
      label: "Aggiungi il primo cliente CRM",
      done: usage.counts.crmClients > 0,
      href: "/dashboard/crm",
    },
    {
      label: "Genera il primo social calendar",
      done: usage.counts.calendars > 0,
      href: "/dashboard/social-calendar",
    },
  ];

  return (
    <DashboardShell
      title="Overview"
      description="La tua console operativa per trasformare idee in contenuti, promo e follow-up piu veloci."
      userEmail={user.email ?? "utente"}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          <div className="bg-gradient-to-r from-slate-950 via-blue-900 to-cyan-700 px-6 py-8 text-white sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
              <DashboardIcon name="spark" className="h-4 w-4" />
              Welcome flow
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Benvenuto, {firstName}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              Hai una base premium pronta per creare contenuti fitness, hair/beauty o sport &
              outdoor, salvare le idee migliori e far lavorare l&apos;AI con il contesto reale della
              tua attivita.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/caption" className="button-primary">
                Fai la prima generazione
              </Link>
              <Link href="/dashboard/settings/business-profile" className="button-secondary border-white/20 bg-white/10 text-white hover:border-white/40 hover:text-white">
                Completa il setup
              </Link>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 sm:grid-cols-3 sm:px-8">
            {[
              { title: "Piano attivo", value: aiPlan.toUpperCase(), helper: `${usage.limits.seats} utenti inclusi` },
              {
                title: "Crediti oggi",
                value: `${usage.counts.aiCreditsToday}/${usage.limits.aiDailyCredits}`,
                helper: `${usage.counts.aiTokensToday} token consumati`,
              },
              { title: "Stato setup", value: businessReady ? "Pronto" : "Da completare", helper: "profilo business e onboarding" },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">{item.title}</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
                <p className="mt-2 text-sm text-slate-500">{item.helper}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Checklist setup</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Porta il workspace online</h2>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {checklist.filter((item) => item.done).length}/{checklist.length} completati
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {checklist.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between gap-3 rounded-[1.5rem] px-4 py-4 transition ${
                  item.done
                    ? "border border-emerald-200 bg-emerald-50"
                    : "border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${item.done ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"}`}>
                    <DashboardIcon name={item.done ? "check" : "play"} className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                </div>
                <span className={`text-xs font-semibold ${item.done ? "text-emerald-700" : "text-blue-700"}`}>
                  {item.done ? "Completato" : "Apri"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <UsageMeter
          title="Crediti AI oggi"
          progress={usage.progress.aiCreditsToday}
          helper="Ogni caption, reel o promo scala da questo budget giornaliero."
          accent="blue"
          upgradeLabel={usage.limits.nextUpgrade?.toUpperCase() ?? null}
        />
        <UsageMeter
          title="Business profile"
          progress={usage.progress.businessProfiles}
          helper="Conta i contesti attivi che puoi usare nei generatori AI."
          accent="emerald"
          upgradeLabel={usage.limits.nextUpgrade?.toUpperCase() ?? null}
        />
        <UsageMeter
          title="Contenuti salvati"
          progress={usage.progress.savedContents}
          helper="La tua libreria riutilizzabile per caption, reel, promo e messaggi."
          accent="amber"
          upgradeLabel={usage.limits.nextUpgrade?.toUpperCase() ?? null}
        />
        <UsageMeter
          title="Calendari salvati"
          progress={usage.progress.calendars}
          helper="Piani editoriali completi pronti da recuperare e rigenerare."
          accent="blue"
          upgradeLabel={usage.limits.nextUpgrade?.toUpperCase() ?? null}
        />
        <UsageMeter
          title="Clienti CRM"
          progress={usage.progress.crmClients}
          helper="Lead e clienti che puoi gestire nel CRM della piattaforma."
          accent="emerald"
          upgradeLabel={usage.limits.nextUpgrade?.toUpperCase() ?? null}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {[
          {
            title: "Caption AI",
            copy: "Crea caption con 3 varianti, CTA forti e formato gia ottimizzato per mobile.",
            href: "/dashboard/caption",
            icon: "caption" as const,
          },
          {
            title: "Reel AI",
            copy: "Ottieni hook, script e CTA piu leggibili e facili da trasformare in video brevi.",
            href: "/dashboard/reels",
            icon: "reel" as const,
          },
          {
            title: "Promo AI",
            copy: "Lancia promo estate, open day e offerte win-back con tono piu professionale.",
            href: "/dashboard/promos",
            icon: "promo" as const,
          },
          {
            title: "Hair AI",
            copy: "Attiva la verticale parrucchieri con caption, Reel, promo e messaggi clienti orientati a booking.",
            href: "/dashboard/hair-captions",
            icon: "caption" as const,
          },
          {
            title: "Sports & Outdoor AI",
            copy: "Lavora su paintball, padel, calcetto e centri outdoor con caption, promo, Reel e messaggi clienti orientati a prenotazione.",
            href: "/dashboard/sports-captions",
            icon: "caption" as const,
          },
          {
            title: "Social Calendar",
            copy: "Pianifica 7, 14 o 30 giorni di contenuti e organizza caption, Reel, Story e TikTok in un calendario completo.",
            href: "/dashboard/social-calendar",
            icon: "calendar" as const,
          },
        ].map((item) => (
          <Link key={item.title} href={item.href} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-blue-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <DashboardIcon name={item.icon} className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-950">{item.title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{item.copy}</p>
            <span className="mt-5 inline-flex text-sm font-semibold text-blue-700">Apri modulo</span>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
