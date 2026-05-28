import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getCurrentUsageDate, normalizeAIPlanId } from "@/lib/ai-usage";
import { requireDashboardUser } from "@/lib/saas";

export default async function DashboardPage() {
  const { supabase, user } = await requireDashboardUser();
  const usageDate = getCurrentUsageDate();
  const [
    { data: profile },
    { count: clientsCount },
    { count: generatedCount },
    { count: savedCount },
    { data: usageToday },
  ] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase
        .from("generated_contents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase.from("saved_contents").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase
        .from("ai_usage_daily")
        .select("generation_count,total_tokens")
        .eq("user_id", user.id)
        .eq("usage_date", usageDate)
        .maybeSingle(),
    ]);
  const aiPlan = normalizeAIPlanId(profile?.subscription_tier);

  return (
    <DashboardShell
      title="Overview"
      description="Una vista rapida del tuo workspace AI: contenuti generati, clienti gestiti e materiali salvati."
      userEmail={user.email ?? "utente"}
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {[ 
          { label: "Piano AI", value: aiPlan, helper: "Tier limiti e rate limiting" },
          { label: "Clienti CRM", value: clientsCount || 0, helper: "Lead e clienti gestiti" },
          { label: "Generazioni AI", value: generatedCount || 0, helper: "Storico completo" },
          { label: "Contenuti salvati", value: savedCount || 0, helper: "Libreria personale" },
          {
            label: "Uso oggi",
            value: usageToday?.generation_count || 0,
            helper: `${usageToday?.total_tokens || 0} token usati oggi`,
          },
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
