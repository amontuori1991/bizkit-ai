import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireDashboardUser } from "@/lib/saas";

export default async function DashboardPage() {
  const { supabase, user } = await requireDashboardUser();
  const [{ data: profile }, { count: clientsCount }, { count: generatedCount }, { count: savedCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase
        .from("generated_contents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase.from("saved_contents").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

  return (
    <DashboardShell
      title="Overview"
      description="Una vista rapida del tuo workspace AI: contenuti generati, clienti gestiti e materiali salvati."
      userEmail={user.email ?? "utente"}
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Piano attuale", value: profile?.subscription_tier || "starter", helper: "Stripe subscriptions ready" },
          { label: "Clienti CRM", value: clientsCount || 0, helper: "Lead e clienti gestiti" },
          { label: "Generazioni AI", value: generatedCount || 0, helper: "Storico completo" },
          { label: "Contenuti salvati", value: savedCount || 0, helper: "Libreria personale" },
        ].map((item) => (
          <div key={item.label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
            <p className="mt-2 text-sm text-slate-500">{item.helper}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">Caption Generator</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Crea caption Instagram coerenti, professionali e pensate per il settore palestra.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">Reel Generator</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Ottieni hook, struttura video e CTA per contenuti brevi piu performanti.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">Promo Generator</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Genera offerte e mini campagne per prove, rinnovi, PT e open day.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
