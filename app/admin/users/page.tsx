import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { AdminUsersManager } from "@/components/AdminUsersManager";
import { isAdminAuthenticated } from "@/lib/admin";
import { listManagedAdminUsers } from "@/lib/admin-users";

export const metadata: Metadata = {
  title: "Admin Users",
  description: "Gestione utenti BizKit AI: piani, usage, cleanup dati e cancellazione completa.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    redirect("/admin/login");
  }

  const data = await listManagedAdminUsers();

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
          </div>

          <AdminUsersManager initialUsers={data.users} configured={data.configured} />
        </div>
      </section>
    </>
  );
}
