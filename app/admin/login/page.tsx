import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Accesso protetto alla dashboard admin di BizKit AI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();

  if (isAdminAuthenticated(cookieStore)) {
    redirect("/admin");
  }

  return (
    <section className="section-shell pt-12 sm:pt-16">
      <div className="container-shell">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
          <span className="eyebrow">Admin Access</span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950">
            Entra nella dashboard
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Accesso protetto con password semplice tramite variabile ambiente. Nessun database richiesto.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Se non hai ancora configurato `ADMIN_PASSWORD`, controlla{" "}
            <Link href="/admin/setup" className="font-semibold text-blue-700">
              /admin/setup
            </Link>
            .
          </p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </section>
  );
}
