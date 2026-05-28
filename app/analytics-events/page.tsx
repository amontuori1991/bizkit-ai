import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Events",
  description:
    "Riepilogo interno degli eventi analytics configurati per BizKit AI.",
  robots: {
    index: false,
    follow: false,
  },
};

const events = [
  {
    name: "view_item",
    trigger: "Pagina prodotto",
    destination: "GA4 + Meta Pixel (ViewContent)",
  },
  {
    name: "begin_checkout",
    trigger: "Click su Acquista ora",
    destination: "GA4 + Meta Pixel (InitiateCheckout)",
  },
  {
    name: "purchase",
    trigger: "Pagina success con session_id valida e pagamento paid",
    destination: "GA4 + Meta Pixel (Purchase)",
  },
  {
    name: "download",
    trigger: "Download protetto del kit",
    destination: "GA4 + Meta Pixel (Download custom)",
  },
  {
    name: "generate_lead",
    trigger: "Submit popup lead magnet",
    destination: "GA4 + Meta Pixel (Lead)",
  },
];

export default function AnalyticsEventsPage() {
  return (
    <section className="section-shell pt-10 sm:pt-14">
      <div className="container-shell">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
          <span className="eyebrow">Analytics Dashboard Ready</span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Eventi pronti per GA4 e Meta Pixel
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Questa pagina riepiloga gli eventi gia cablati nel progetto, utile come checklist
            di implementazione e base per la dashboard marketing.
          </p>
          <div className="mt-8 grid gap-4">
            {events.map((event) => (
              <div key={event.name} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="font-semibold text-slate-950">{event.name}</p>
                <p className="mt-2 text-sm text-slate-600">Trigger: {event.trigger}</p>
                <p className="mt-1 text-sm text-slate-600">Destinazione: {event.destination}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
