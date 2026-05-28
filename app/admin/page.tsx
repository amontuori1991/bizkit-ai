import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboardView } from "@/components/AdminDashboardView";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { isAdminAuthenticated } from "@/lib/admin";
import { getAdminDashboardData } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Dashboard interna di BizKit AI per prodotti, lead, download e vendite mock.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    redirect("/admin/login");
  }

  const data = await getAdminDashboardData();

  return (
    <>
      <div className="absolute right-4 top-4 z-40 sm:right-8 sm:top-6">
        <AdminLogoutButton />
      </div>
      <AdminDashboardView {...data} />
    </>
  );
}
