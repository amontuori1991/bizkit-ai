import type { Metadata } from "next";
import Link from "next/link";
import { DemoCalendarSection } from "@/components/demo/DemoCalendarSection";
import { GeneratorWorkspace } from "@/components/dashboard/GeneratorWorkspace";
import type { BusinessProfile } from "@/lib/business-profile";
import { isOpenAIConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Demo gratuita",
  description:
    "Prova una generazione AI gratuita di BizKit AI senza login e scegli tra verticale palestra e parrucchiere.",
  alternates: { canonical: "/demo" },
};

type DemoPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DemoPage({ searchParams }: DemoPageProps) {
  const aiEnabled = isOpenAIConfigured();
  const params = searchParams ? await searchParams : {};
  const rawVertical = params.vertical;
  const vertical = (Array.isArray(rawVertical) ? rawVertical[0] : rawVertical) === "hair" ? "hair" : "gym";
  const isHair = vertical === "hair";
  const demoProfile: BusinessProfile = isHair
    ? {
        id: "demo",
        user_id: "demo",
        business_name: "Atelier Glow Hair",
        business_type: "hair_salon",
        city: "Milano",
        address: null,
        website: null,
        instagram: "@atelierglowhair",
        tone_of_voice: "Moderno, fashion, emozionale",
        target_audience: "Donne 24-45 che cercano colore, styling e trasformazioni premium",
        services: "Balayage, colore, piega, trattamento, extension",
        unique_selling_points: "Consulenza look personalizzata, premium experience, risultato fotografabile",
        preferred_cta: "Prenota il tuo appuntamento",
        preferred_hashtags: "#hairstylemilano #balayage #hairtransformation",
        salon_specialties: "Balayage, colore, trasformazioni capelli",
        booking_link: "https://booking.example.com",
        opening_hours: "Mar-Sab 9:00-19:00",
        stylist_names: "Giulia, Marco",
        products_used: "Kerastase, Olaplex",
        salon_style: "Luxury salon",
        created_at: new Date().toISOString(),
      }
    : {
        id: "demo",
        user_id: "demo",
        business_name: "Palestra Energia",
        business_type: "gym",
        city: "Milano",
        address: null,
        website: null,
        instagram: "@palestraenergia",
        tone_of_voice: "Professionale, energico, accogliente",
        target_audience: "Uomini e donne 28-45 che vogliono tornare in forma",
        services: "Sala pesi, coaching, small group",
        unique_selling_points: "Coach dedicati, ambiente motivante, percorsi su misura",
        preferred_cta: "Prenota la prova gratuita",
        preferred_hashtags: "#palestramilano #fitnessmilano",
        salon_specialties: null,
        booking_link: null,
        opening_hours: null,
        stylist_names: null,
        products_used: null,
        salon_style: null,
        created_at: new Date().toISOString(),
      };

  return (
    <section className="section-shell pt-12 sm:pt-20">
      <div className="container-shell space-y-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          <div className={`px-6 py-10 text-white sm:px-10 ${isHair ? "bg-gradient-to-r from-slate-950 via-pink-800 to-rose-500" : "bg-gradient-to-r from-slate-950 via-blue-900 to-cyan-700"}`}>
            <span className="eyebrow border-white/15 bg-white/10 text-white">Demo gratuita</span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Prova BizKit AI senza login
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">
              Hai una sola generazione gratuita da questo browser: ottieni 3 versioni del contenuto
              e valuta subito il livello del prodotto per {isHair ? "saloni parrucchieri" : "palestre"}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/demo?vertical=gym"
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  !isHair ? "bg-white text-slate-950" : "border border-white/20 bg-white/10 text-white"
                }`}
              >
                Demo palestra
              </Link>
              <Link
                href="/demo?vertical=hair"
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  isHair ? "bg-white text-slate-950" : "border border-white/20 bg-white/10 text-white"
                }`}
              >
                Demo parrucchiere
              </Link>
              <Link href="/pricing" className="button-secondary border-white/20 bg-white/10 text-white hover:border-white/40 hover:text-white">
                Vedi i piani
              </Link>
            </div>
          </div>
        </div>

        <GeneratorWorkspace
          type={isHair ? "hair_caption" : "caption"}
          title={isHair ? "Demo Hair AI" : "Demo Caption AI"}
          helper={
            isHair
              ? "Scrivi una richiesta breve e ricevi 3 varianti premium per saloni, barber shop e hair stylist."
              : "Scrivi una richiesta breve e ricevi 3 varianti premium per palestre e business fitness."
          }
          placeholder={
            isHair
              ? "Esempio: Scrivi una caption per promuovere un balayage premium con posti limitati."
              : "Esempio: Scrivi una caption per promuovere una prova gratuita di 7 giorni in una palestra moderna."
          }
          enabled={aiEnabled}
          disabledMessage="OpenAI non e configurato. La demo AI e temporaneamente disattivata."
          profileReady
          endpoint="/api/ai/demo"
          allowSave={false}
          businessType={isHair ? "hair_salon" : "gym"}
          onboardingTitle="Come funziona la demo"
          onboardingSteps={[
            "Scegli il verticale che vuoi testare: palestra o parrucchiere.",
            "Scrivi una richiesta operativa breve e ricevi tre versioni: short, medium e long.",
            "Se il risultato ti convince, crea un account per sbloccare salvataggi, CRM e cronologia.",
          ]}
          quickTemplates={
            isHair
              ? [
                  { label: "Promo balayage", prompt: "Scrivi una caption per promuovere un balayage premium con posti limitati." },
                  { label: "Nuovo look estate", prompt: "Scrivi una caption per lanciare un nuovo look estate in salone." },
                  { label: "Prima/Dopo", prompt: "Scrivi una caption prima/dopo per una trasformazione capelli." },
                  { label: "Reminder appuntamento", prompt: "Scrivi un reminder appuntamento elegante per una cliente." },
                  { label: "Offerta last minute", prompt: "Scrivi una promo last minute per riempire uno slot oggi." },
                ]
              : [
                  { label: "Promo estate", prompt: "Scrivi una caption per promuovere una promo estate con posti limitati." },
                  { label: "Open day", prompt: "Scrivi una caption per invitare lead locali a un open day in palestra." },
                  { label: "Trasformazione cliente", prompt: "Scrivi una caption per raccontare una trasformazione cliente in modo credibile." },
                  { label: "Prova gratuita", prompt: "Scrivi una caption per spingere la prova gratuita di 7 giorni." },
                  { label: "Recupero inattivi", prompt: "Scrivi una caption per riattivare clienti inattivi con una promo rientro." },
                ]
          }
          typeOptions={
            isHair
              ? [
                  { value: "hair_caption", label: "Caption" },
                  { value: "hair_reel_script", label: "Reel script" },
                  { value: "hair_client_message", label: "WhatsApp clienti" },
                ]
              : [
                  { value: "caption", label: "Caption" },
                  { value: "reel", label: "Reel" },
                  { value: "promo", label: "Promo" },
                ]
          }
        />

        <DemoCalendarSection
          profile={demoProfile}
          enabled={aiEnabled}
          disabledMessage="OpenAI non e configurato. La demo calendario e temporaneamente disattivata."
        />
      </div>
    </section>
  );
}
