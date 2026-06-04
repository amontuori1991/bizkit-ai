import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gymKitDownloads } from "@/data/downloads";
import { products } from "@/data/products";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { readLeads, type LeadEntry } from "@/lib/leads";
import { getSiteSettingsStorageMode, readSiteSettings } from "@/lib/site-settings";

export type MockSale = {
  id: string;
  customer: string;
  productSlug: string;
  amount: number;
  status: "paid" | "pending" | "refunded";
  purchasedAt: string;
};

export type DownloadStat = {
  assetId: string;
  count: number;
  updatedAt: string;
};

export type AdminUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  businessName: string | null;
  subscriptionTier: string | null;
  createdAt: string;
};

const dataDir = path.join(process.cwd(), ".data");
const salesFile = path.join(dataDir, "mock-sales.json");
const downloadsFile = path.join(dataDir, "downloads.json");

const defaultSales: MockSale[] = [
  {
    id: "sale_001",
    customer: "Marco Bianchi",
    productSlug: "ai-kit-per-palestre",
    amount: 29,
    status: "paid",
    purchasedAt: "2026-05-20T09:30:00.000Z",
  },
  {
    id: "sale_002",
    customer: "Giulia Serra",
    productSlug: "ai-kit-per-palestre",
    amount: 29,
    status: "paid",
    purchasedAt: "2026-05-22T15:10:00.000Z",
  },
  {
    id: "sale_003",
    customer: "Luca Moretti",
    productSlug: "ai-kit-per-palestre",
    amount: 29,
    status: "pending",
    purchasedAt: "2026-05-27T11:45:00.000Z",
  },
];

const defaultDownloads: DownloadStat[] = [
  {
    assetId: "ai-kit-per-palestre.zip",
    count: 14,
    updatedAt: "2026-05-28T07:55:00.000Z",
  },
  {
    assetId: "10-prompt-ai-gratis-per-palestre.pdf",
    count: 31,
    updatedAt: "2026-05-28T07:58:00.000Z",
  },
];

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T) {
  await ensureDataDir();

  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    await writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

export async function getMockSales() {
  return readJsonFile<MockSale[]>(salesFile, defaultSales);
}

export async function getDownloadStats() {
  return readJsonFile<DownloadStat[]>(downloadsFile, defaultDownloads);
}

async function getAdminUsers() {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return {
      configured: false,
      users: [] as AdminUser[],
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, business_name, subscription_tier, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Admin users load error:", error);
    return {
      configured: true,
      users: [] as AdminUser[],
    };
  }

  return {
    configured: true,
    users:
      data?.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        businessName: user.business_name,
        subscriptionTier: user.subscription_tier,
        createdAt: user.created_at,
      })) ?? [],
  };
}

export async function getAdminDashboardData() {
  const [sales, downloads, leads, siteSettings, adminUsers] = await Promise.all([
    getMockSales(),
    getDownloadStats(),
    readLeads(),
    readSiteSettings(),
    getAdminUsers(),
  ]);

  const paidSales = sales.filter((sale) => sale.status === "paid");
  const totalRevenue = paidSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalDownloads = downloads.reduce((sum, item) => sum + item.count, 0);
  const availableProducts = products.filter((product) => product.status === "available").length;

  return {
    stats: {
      totalProducts: products.length,
      availableProducts,
      totalLeads: leads.length,
      totalDownloads,
      totalRevenue,
      paidOrders: paidSales.length,
    },
    products,
    leads,
    sales,
    downloads,
    kitAssets: gymKitDownloads,
    siteSettings,
    siteSettingsStorageMode: getSiteSettingsStorageMode(),
    users: adminUsers.users,
    usersConfigured: adminUsers.configured,
  };
}
