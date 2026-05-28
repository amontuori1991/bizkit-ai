import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/env";

export type SiteSettings = {
  contactEmail: string;
  supportEmail: string;
  instagramHandle: string;
  businessAvailability: string;
};

export type SiteSettingsStorageMode = "supabase" | "local" | "readonly";

type SiteSettingsRow = {
  id: string;
  contact_email: string | null;
  support_email: string | null;
  instagram_handle: string | null;
  business_availability: string | null;
  updated_at?: string | null;
};

const dataDir = path.join(process.cwd(), ".data");
const siteSettingsFile = path.join(dataDir, "site-settings.json");
const SITE_SETTINGS_ID = "default";

export const defaultSiteSettings: SiteSettings = {
  contactEmail: "hello@bizkitai.it",
  supportEmail: "hello@bizkitai.it",
  instagramHandle: "@bizkitai",
  businessAvailability: "lun-ven, 9:00 - 18:00",
};

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

function normalizeSettings(input: Partial<SiteSettings>): SiteSettings {
  return {
    contactEmail: input.contactEmail?.trim() || defaultSiteSettings.contactEmail,
    supportEmail: input.supportEmail?.trim() || input.contactEmail?.trim() || defaultSiteSettings.supportEmail,
    instagramHandle: input.instagramHandle?.trim() || defaultSiteSettings.instagramHandle,
    businessAvailability:
      input.businessAvailability?.trim() || defaultSiteSettings.businessAvailability,
  };
}

function fromRow(row: SiteSettingsRow | null | undefined) {
  if (!row) {
    return defaultSiteSettings;
  }

  return normalizeSettings({
    contactEmail: row.contact_email ?? undefined,
    supportEmail: row.support_email ?? undefined,
    instagramHandle: row.instagram_handle ?? undefined,
    businessAvailability: row.business_availability ?? undefined,
  });
}

function toRow(input: SiteSettings): SiteSettingsRow {
  return {
    id: SITE_SETTINGS_ID,
    contact_email: input.contactEmail,
    support_email: input.supportEmail,
    instagram_handle: input.instagramHandle,
    business_availability: input.businessAvailability,
  };
}

async function readLocalSiteSettings() {
  await ensureDataDir();

  try {
    const raw = await readFile(siteSettingsFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return normalizeSettings(parsed);
  } catch {
    return defaultSiteSettings;
  }
}

async function writeLocalSiteSettings(input: SiteSettings) {
  await ensureDataDir();
  const normalized = normalizeSettings(input);
  await writeFile(siteSettingsFile, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
}

export function getSiteSettingsStorageMode(): SiteSettingsStorageMode {
  if (isSupabaseAdminConfigured()) {
    return "supabase";
  }

  if (process.env.VERCEL) {
    return "readonly";
  }

  return "local";
}

export async function readSiteSettings() {
  if (isSupabaseAdminConfigured()) {
    const supabase = createSupabaseServiceRoleClient();

    if (supabase) {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", SITE_SETTINGS_ID)
        .maybeSingle();

      if (!error) {
        return fromRow(data as SiteSettingsRow | null);
      }
    }
  }

  return readLocalSiteSettings();
}

export async function writeSiteSettings(input: SiteSettings) {
  const normalized = normalizeSettings(input);

  if (isSupabaseAdminConfigured()) {
    const supabase = createSupabaseServiceRoleClient();

    if (!supabase) {
      throw new Error("Supabase service role non disponibile.");
    }

    const { data, error } = await supabase
      .from("site_settings")
      .upsert(toRow(normalized), { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      throw new Error(
        "Impossibile salvare su Supabase. Verifica che la tabella public.site_settings esista e che SUPABASE_SERVICE_ROLE_KEY sia corretta.",
      );
    }

    return fromRow(data as SiteSettingsRow);
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Il salvataggio locale non e disponibile su Vercel. Configura Supabase service role per rendere modificabili queste impostazioni in produzione.",
    );
  }

  return writeLocalSiteSettings(normalized);
}

