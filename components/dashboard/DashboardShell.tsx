"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandLockup } from "@/components/BrandLogo";
import { DashboardIcon } from "@/components/dashboard/DashboardIcon";
import {
  getBusinessTypeLabel,
  isHairBusinessType,
  isSportsBusinessType,
} from "@/lib/business-verticals";

const THEME_KEY = "bizkit-ai-saas-theme";

type SidebarContext = {
  hasProfile: boolean;
  activeBusinessType: string | null;
  hasCompleteProfile: boolean;
};

type DashboardShellIconName =
  | "spark"
  | "caption"
  | "reel"
  | "promo"
  | "crm"
  | "message"
  | "calendar"
  | "history"
  | "settings"
  | "billing";

type NavItem = {
  href: string;
  label: string;
  icon: DashboardShellIconName;
};

type VerticalMeta = {
  badge: "Hair" | "Sports" | "Fitness" | null;
  accentClass: string;
  navItems: NavItem[];
};

type DashboardShellProps = {
  title: string;
  description: string;
  userEmail: string;
  children: React.ReactNode;
};

const COMMON_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "spark" },
  { href: "/dashboard/assistant", label: "AI Business Coach", icon: "message" },
  { href: "/dashboard/social-calendar", label: "Social Calendar", icon: "calendar" },
  { href: "/dashboard/calendars", label: "Calendars", icon: "history" },
  { href: "/dashboard/crm", label: "CRM", icon: "crm" },
  { href: "/dashboard/history", label: "Cronologia", icon: "history" },
  { href: "/dashboard/purchases", label: "I miei acquisti", icon: "history" },
  { href: "/dashboard/settings/business-profile", label: "Business Profile", icon: "settings" },
  { href: "/dashboard/billing", label: "Billing", icon: "billing" },
];

const FITNESS_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/caption", label: "Caption AI", icon: "caption" },
  { href: "/dashboard/reels", label: "Reel AI", icon: "reel" },
  { href: "/dashboard/promos", label: "Promo AI", icon: "promo" },
];

const HAIR_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/hair-captions", label: "Hair Captions", icon: "caption" },
  { href: "/dashboard/hair-reels", label: "Hair Reels", icon: "reel" },
  { href: "/dashboard/hair-promos", label: "Hair Promos", icon: "promo" },
  { href: "/dashboard/hair-client-messages", label: "Hair Messages", icon: "message" },
];

const SPORTS_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/sports-captions", label: "Sports Captions", icon: "caption" },
  { href: "/dashboard/sports-reels", label: "Sports Reels", icon: "reel" },
  { href: "/dashboard/sports-promos", label: "Sports Promos", icon: "promo" },
  { href: "/dashboard/sports-client-messages", label: "Sports Messages", icon: "message" },
];

function getVerticalMeta(businessType: string | null): VerticalMeta {
  if (isHairBusinessType(businessType)) {
    return {
      badge: "Hair",
      accentClass: "border-pink-200 bg-pink-50 text-pink-700",
      navItems: [...COMMON_NAV_ITEMS.slice(0, 1), ...HAIR_NAV_ITEMS, ...COMMON_NAV_ITEMS.slice(1)],
    };
  }

  if (isSportsBusinessType(businessType)) {
    return {
      badge: "Sports",
      accentClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
      navItems: [...COMMON_NAV_ITEMS.slice(0, 1), ...SPORTS_NAV_ITEMS, ...COMMON_NAV_ITEMS.slice(1)],
    };
  }

  if (businessType) {
    return {
      badge: "Fitness",
      accentClass: "border-blue-200 bg-blue-50 text-blue-700",
      navItems: [...COMMON_NAV_ITEMS.slice(0, 1), ...FITNESS_NAV_ITEMS, ...COMMON_NAV_ITEMS.slice(1)],
    };
  }

  return {
    badge: null,
    accentClass: "border-slate-200 bg-slate-50 text-slate-700",
    navItems: [
      { href: "/dashboard", label: "Overview", icon: "spark" },
      { href: "/dashboard/settings/business-profile", label: "Business Profile", icon: "settings" },
      { href: "/dashboard/billing", label: "Billing", icon: "billing" },
    ],
  };
}

export function DashboardShell({
  title,
  description,
  userEmail,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarContext, setSidebarContext] = useState<SidebarContext>({
    hasProfile: false,
    activeBusinessType: null,
    hasCompleteProfile: false,
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSidebarContext() {
      try {
        const response = await fetch("/api/dashboard/sidebar-context", {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as SidebarContext;
        if (isMounted) {
          setSidebarContext(data);
        }
      } catch {
        // keep fallback state
      }
    }

    void loadSidebarContext();

    function handleProfileUpdate() {
      void loadSidebarContext();
    }

    window.addEventListener("bizkit:business-profile-updated", handleProfileUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("bizkit:business-profile-updated", handleProfileUpdate);
    };
  }, [pathname]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
  }

  const isDark = theme === "dark";
  const shell = isDark
    ? "bg-[radial-gradient(circle_at_top,#172554_0%,#0f172a_38%,#020617_100%)] text-slate-100"
    : "bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_18%,#f8fafc_55%,#eef2ff_100%)] text-slate-900";
  const surface = isDark
    ? "border-white/10 bg-slate-950/70 backdrop-blur-xl"
    : "border-white/60 bg-white/80 backdrop-blur-xl";
  const subtle = isDark ? "text-slate-400" : "text-slate-500";

  const verticalMeta = useMemo(
    () => getVerticalMeta(sidebarContext.activeBusinessType),
    [sidebarContext.activeBusinessType],
  );

  async function logout() {
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className={`min-h-screen ${shell}`}>
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-0 xl:grid-cols-[320px_1fr]">
        <aside className={`border-b p-4 sm:p-6 xl:border-b-0 xl:border-r ${surface}`}>
          <div className="flex items-start justify-between gap-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <BrandLockup
                size="md"
                tone={isDark ? "light" : "dark"}
                tagline="AI Marketing Platform"
                taglineClassName={subtle}
              />
            </Link>
            <button type="button" onClick={toggleTheme} className="button-secondary px-4 py-2">
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          <div
            className={`mt-6 overflow-hidden rounded-[1.75rem] border p-5 ${
              isDark
                ? "border-white/10 bg-gradient-to-br from-blue-950/70 via-slate-950 to-slate-950"
                : "border-slate-200 bg-gradient-to-br from-white via-blue-50 to-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <DashboardIcon name="spark" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Workspace premium</p>
                <p className={`text-sm ${subtle}`}>{userEmail}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className={`rounded-2xl px-4 py-3 ${isDark ? "bg-white/5" : "bg-white"}`}>
                <p className={`text-xs uppercase tracking-[0.18em] ${subtle}`}>Status</p>
                <p className="mt-2 text-sm font-semibold">
                  {sidebarContext.hasCompleteProfile ? "AI ready" : "Setup needed"}
                </p>
              </div>
              <div className={`rounded-2xl px-4 py-3 ${isDark ? "bg-white/5" : "bg-white"}`}>
                <p className={`text-xs uppercase tracking-[0.18em] ${subtle}`}>Verticale</p>
                <p className="mt-2 text-sm font-semibold">
                  {sidebarContext.activeBusinessType
                    ? getBusinessTypeLabel(sidebarContext.activeBusinessType)
                    : "Da definire"}
                </p>
              </div>
            </div>
            {verticalMeta.badge ? (
              <div
                className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${verticalMeta.accentClass}`}
              >
                Verticale attiva: {verticalMeta.badge}
              </div>
            ) : null}
          </div>

          <nav className="mt-6 grid gap-2">
            {verticalMeta.navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20"
                      : isDark
                        ? "text-slate-300 hover:bg-white/5"
                        : "text-slate-700 hover:bg-white"
                  }`}
                >
                  <DashboardIcon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[1.5rem] border border-dashed border-blue-300/50 p-4">
            <p className="text-sm font-semibold">
              {sidebarContext.hasProfile ? "Vuoi andare piu veloce?" : "Completa il profilo prima di partire"}
            </p>
            <p className={`mt-2 text-sm leading-6 ${subtle}`}>
              {sidebarContext.hasProfile
                ? "Completa il Business Profile e usa i template rapidi per sbloccare output piu coerenti fin dalla prima generazione."
                : "Imposta prima il Business Profile primario per attivare i generatori della verticale corretta e vedere la sidebar completa."}
            </p>
            <Link
              href="/dashboard/settings/business-profile"
              className="mt-4 inline-flex text-sm font-semibold text-blue-600"
            >
              Apri il setup
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/pricing" className="button-secondary">
              Vedi pricing
            </Link>
            <button type="button" onClick={logout} className="button-secondary">
              Esci
            </button>
          </div>
        </aside>

        <main className="p-4 sm:p-6 xl:p-8">
          <div className={`overflow-hidden rounded-[2rem] border p-6 shadow-soft sm:p-8 ${surface}`}>
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">
                  Workspace
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
                <p className={`mt-3 max-w-3xl leading-7 ${subtle}`}>{description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Precisione", value: "AI Context" },
                  { label: "Output", value: "3 versioni" },
                  { label: "UX", value: "Mobile ready" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-[1.5rem] border px-4 py-4 ${
                      isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className={`text-xs uppercase tracking-[0.18em] ${subtle}`}>{item.label}</p>
                    <p className="mt-2 text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
