import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminFeedbackManager } from "@/components/AdminFeedbackManager";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { isAdminAuthenticated } from "@/lib/admin";
import { listAdminFeedbackItems } from "@/lib/admin-feedback";

export const metadata: Metadata = {
  title: "Admin Feedback",
  description: "Gestione feedback beta tester BizKit AI: bug, richieste feature e miglioramenti.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    redirect("/admin/login");
  }

  const data = await listAdminFeedbackItems();

  return (
    <>
      <div className="absolute right-4 top-4 z-40 sm:right-8 sm:top-6">
        <AdminLogoutButton />
      </div>
      <section className="section-shell pt-12 sm:pt-16">
        <div className="container-shell space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/admin" className="button-secondary">
              Torna alla dashboard
            </Link>
            <Link href="/admin/analytics" className="button-secondary">
              Apri analytics
            </Link>
            <Link href="/admin/users" className="button-secondary">
              Gestione utenti
            </Link>
          </div>

          <AdminFeedbackManager initialFeedback={data.feedback} configured={data.configured} />
        </div>
      </section>
    </>
  );
}

