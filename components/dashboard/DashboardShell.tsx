"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/caption", label: "Caption AI" },
  { href: "/dashboard/reels", label: "Reel AI" },
  { href: "/dashboard/promos", label: "Promo AI" },
  { href: "/dashboard/crm", label: "CRM" },
  { href: "/dashboard/history", label: "Cronologia" },
  { href: "/dashboard/billing", label: "Billing" },
];

const THEME_KEY = "bizkit-ai-saas-theme";

type DashboardShellProps = {
  title: string;
  description: string;
  userEmail: string;
  children: React.ReactNode;
};

export function DashboardShell({
  title,
  description,
  userEmail,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
  }

  const isDark = theme === "dark";
  const shell = isDark ? "bg-[#0b1020] text-slate-100" : "bg-[#f5f7fb] text-slate-900";
  const surface = isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white";
  const subtle = isDark ? "text-slate-400" : "text-slate-500";

  async function logout() {
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className={`min-h-screen ${shell}`}>
      <div className="mx-auto grid min-h-screen max-w-7xl gap-0 xl:grid-cols-[280px_1fr]">
        <aside className={`border-b p-6 xl:border-b-0 xl:border-r ${surface}`}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-base font-bold text-white">
              BK
            </div>
            <div>
              <p className="text-lg font-bold">BizKit AI</p>
              <p className={`text-sm ${subtle}`}>SaaS operativo per fitness</p>
            </div>
          </Link>
          <div className={`mt-6 rounded-[1.5rem] border p-4 ${isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
            <p className="text-sm font-semibold">Account</p>
            <p className={`mt-2 text-sm ${subtle}`}>{userEmail}</p>
          </div>
          <nav className="mt-6 grid gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white"
                      : isDark
                        ? "text-slate-300 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <button type="button" onClick={toggleTheme} className="button-secondary">
              {theme === "dark" ? "Passa a light" : "Passa a dark"}
            </button>
            <button type="button" onClick={logout} className="button-secondary">
              Esci
            </button>
          </div>
        </aside>

        <main className="p-4 sm:p-6 xl:p-8">
          <div className={`rounded-[2rem] border p-6 shadow-soft sm:p-8 ${surface}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">
              Workspace
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">{title}</h1>
            <p className={`mt-3 max-w-3xl leading-7 ${subtle}`}>{description}</p>
          </div>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
