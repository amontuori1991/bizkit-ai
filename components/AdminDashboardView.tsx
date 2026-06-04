"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminSiteSettingsForm } from "@/components/AdminSiteSettingsForm";
import { AdminThemeToggle } from "@/components/AdminThemeToggle";
import { AdminUsersPanel } from "@/components/AdminUsersPanel";
import type { DownloadFile } from "@/data/downloads";
import type { Product } from "@/data/products";
import type { LeadEntry } from "@/lib/leads";
import type { AdminUser, DownloadStat, MockSale } from "@/lib/admin-data";
import type { SiteSettings, SiteSettingsStorageMode } from "@/lib/site-settings";

type AdminDashboardViewProps = {
  stats: {
    totalProducts: number;
    availableProducts: number;
    totalLeads: number;
    totalDownloads: number;
    totalRevenue: number;
    paidOrders: number;
  };
  products: Product[];
  leads: LeadEntry[];
  sales: MockSale[];
  downloads: DownloadStat[];
  kitAssets: DownloadFile[];
  siteSettings: SiteSettings;
  siteSettingsStorageMode: SiteSettingsStorageMode;
  users: AdminUser[];
  usersConfigured: boolean;
};

const THEME_KEY = "bizkit-ai-admin-theme";

export function AdminDashboardView({
  stats,
  products,
  leads,
  sales,
  downloads,
  kitAssets,
  siteSettings,
  siteSettingsStorageMode,
  users,
  usersConfigured,
}: AdminDashboardViewProps) {
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
  const shell = isDark
    ? "bg-slate-950 text-slate-100"
    : "bg-slate-50 text-slate-900";
  const surface = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";
  const subtle = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const panel = isDark ? "bg-slate-950/70" : "bg-slate-50";

  return (
    <div className={`min-h-screen ${shell}`}>
      <div className="container-shell py-8 sm:py-10">
        <div className={`rounded-[2rem] border p-6 shadow-soft sm:p-8 ${surface}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
                Admin Dashboard
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Controllo rapido di BizKit AI
              </h1>
              <p className={`mt-3 max-w-2xl leading-7 ${subtle}`}>
                Una dashboard semplice per monitorare prodotti, download, lead raccolti, vendite mock
                e statistiche base senza database.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/admin/analytics" className="button-secondary">
                Apri analytics
              </Link>
              <AdminThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              { label: "Prodotti", value: stats.totalProducts, helper: `${stats.availableProducts} attivi` },
              { label: "Lead raccolti", value: stats.totalLeads, helper: "JSON locale" },
              { label: "Download", value: stats.totalDownloads, helper: "Kit + freebie" },
              { label: "Ordini pagati", value: stats.paidOrders, helper: "Vendite mock" },
              { label: "Fatturato mock", value: `€${stats.totalRevenue}`, helper: "Somma ordini paid" },
            ].map((item) => (
              <div key={item.label} className={`rounded-[1.5rem] border p-5 ${card}`}>
                <p className={`text-sm ${subtle}`}>{item.label}</p>
                <p className="mt-3 text-3xl font-bold">{item.value}</p>
                <p className={`mt-2 text-sm ${subtle}`}>{item.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <AdminUsersPanel initialUsers={users} configured={usersConfigured} isDark={isDark} />
        </div>

        <div className="mt-8">
          <section className={`rounded-[2rem] border p-6 shadow-soft ${surface}`}>
            <h2 className="text-2xl font-bold">Contatti sito</h2>
            <p className={`mt-3 max-w-2xl leading-7 ${subtle}`}>
              Modifica qui i contatti pubblici mostrati nelle pagine del sito come `/contatti` e
              l&apos;email supporto usata nelle conferme acquisto.
            </p>
            <p className={`mt-2 text-sm ${subtle}`}>
              Storage attuale:{" "}
              <span className="font-semibold text-slate-900">
                {siteSettingsStorageMode === "supabase"
                  ? "Supabase"
                  : siteSettingsStorageMode === "local"
                    ? "JSON locale"
                    : "read-only fallback"}
              </span>
            </p>
            <AdminSiteSettingsForm
              initialSettings={siteSettings}
              storageMode={siteSettingsStorageMode}
            />
          </section>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className={`rounded-[2rem] border p-6 shadow-soft ${surface}`}>
            <h2 className="text-2xl font-bold">Prodotti</h2>
            <div className="mt-5 grid gap-4">
              {products.map((product) => (
                <div key={product.id} className={`rounded-[1.5rem] border p-4 ${card}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className={`mt-1 text-sm ${subtle}`}>{product.category}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.status === "available"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {product.status === "available" ? "Disponibile" : "Coming soon"}
                    </span>
                  </div>
                  <p className={`mt-3 text-sm ${subtle}`}>{product.shortDescription}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={`rounded-[2rem] border p-6 shadow-soft ${surface}`}>
            <h2 className="text-2xl font-bold">Download</h2>
            <div className="mt-5 space-y-4">
              {downloads.map((item) => (
                <div key={item.assetId} className={`rounded-[1.5rem] border p-4 ${card}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.assetId}</p>
                      <p className={`mt-1 text-sm ${subtle}`}>Aggiornato: {new Date(item.updatedAt).toLocaleString("it-IT")}</p>
                    </div>
                    <p className="text-2xl font-bold">{item.count}</p>
                  </div>
                </div>
              ))}
              <div className={`rounded-[1.5rem] border p-4 ${panel} ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <p className="font-semibold">Asset inclusi nel kit premium</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {kitAssets.map((asset) => (
                    <span
                      key={asset.id}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${isDark ? "bg-slate-800 text-slate-200" : "bg-white text-slate-700"}`}
                    >
                      {asset.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className={`rounded-[2rem] border p-6 shadow-soft ${surface}`}>
            <h2 className="text-2xl font-bold">Lead raccolti</h2>
            <div className="mt-5 space-y-4">
              {leads.length === 0 ? (
                <div className={`rounded-[1.5rem] border p-5 ${card}`}>
                  <p className={subtle}>Nessun lead ancora registrato. Il file JSON verra popolato al primo submit del lead magnet.</p>
                </div>
              ) : (
                leads.map((lead) => (
                  <div key={`${lead.email}-${lead.createdAt}`} className={`rounded-[1.5rem] border p-4 ${card}`}>
                    <p className="font-semibold">{lead.email}</p>
                    <p className={`mt-1 text-sm ${subtle}`}>Sorgente: {lead.source}</p>
                    <p className={`mt-1 text-sm ${subtle}`}>Asset: {lead.asset}</p>
                    <p className={`mt-1 text-sm ${subtle}`}>Data: {new Date(lead.createdAt).toLocaleString("it-IT")}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={`rounded-[2rem] border p-6 shadow-soft ${surface}`}>
            <h2 className="text-2xl font-bold">Vendite mock</h2>
            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <div className={`grid grid-cols-[1.1fr_1fr_0.7fr_0.9fr] gap-3 px-4 py-3 text-sm font-semibold ${isDark ? "bg-slate-800 text-slate-200 border-slate-800" : "bg-slate-100 text-slate-700"}`}>
                <span>Cliente</span>
                <span>Prodotto</span>
                <span>Importo</span>
                <span>Stato</span>
              </div>
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className={`grid grid-cols-[1.1fr_1fr_0.7fr_0.9fr] gap-3 border-t px-4 py-4 text-sm ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
                >
                  <span>{sale.customer}</span>
                  <span>{sale.productSlug}</span>
                  <span>€{sale.amount}</span>
                  <span
                    className={`font-semibold ${
                      sale.status === "paid"
                        ? "text-emerald-500"
                        : sale.status === "pending"
                          ? "text-amber-500"
                          : "text-red-500"
                    }`}
                  >
                    {sale.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
