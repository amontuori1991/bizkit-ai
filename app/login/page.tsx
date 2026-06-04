import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { BrandLockup } from "@/components/BrandLogo";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Login",
  description: "Accedi a BizKit AI, AI Marketing Platform for Local Businesses.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const user = supabase
    ? (
        await supabase.auth.getUser()
      ).data.user
    : null;

  if (user) {
    redirect("/dashboard");
  }

  return (
    <section className="section-shell pt-12 sm:pt-16">
      <div className="container-shell">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
          <div className="mb-6 flex justify-center sm:justify-start">
            <BrandLockup size="lg" tagline="AI Marketing Platform for Local Businesses" />
          </div>
          <span className="eyebrow">Login</span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950">Accedi al workspace</h1>
          <p className="mt-4 leading-7 text-slate-600">
            Entra nella piattaforma per generare contenuti AI, gestire clienti e salvare il tuo lavoro.
          </p>
          {!isSupabaseConfigured() ? (
            <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-700">
              Supabase non e ancora configurato. Login e signup restano disattivati finche non
              imposti URL e chiavi del progetto. Controlla{" "}
              <Link href="/admin/setup" className="font-semibold underline">
                /admin/setup
              </Link>
              .
            </div>
          ) : null}
          <div className="mt-8">
            <AuthForm
              mode="login"
              disabled={!isSupabaseConfigured()}
              disabledMessage="Per attivare il login configura NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
            />
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Non hai ancora un account?{" "}
            <Link href="/signup" className="font-semibold text-blue-700">
              Crea il tuo account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
