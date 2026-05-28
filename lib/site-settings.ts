import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type SiteSettings = {
  contactEmail: string;
  supportEmail: string;
  instagramHandle: string;
  businessAvailability: string;
};

const dataDir = path.join(process.cwd(), ".data");
const siteSettingsFile = path.join(dataDir, "site-settings.json");

export const defaultSiteSettings: SiteSettings = {
  contactEmail: "hello@bizkitai.it",
  supportEmail: "hello@bizkitai.it",
  instagramHandle: "@bizkitai",
  businessAvailability: "lun-ven, 9:00 - 18:00",
};

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

export async function readSiteSettings() {
  await ensureDataDir();

  try {
    const raw = await readFile(siteSettingsFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;

    return {
      contactEmail: parsed.contactEmail || defaultSiteSettings.contactEmail,
      supportEmail: parsed.supportEmail || parsed.contactEmail || defaultSiteSettings.supportEmail,
      instagramHandle: parsed.instagramHandle || defaultSiteSettings.instagramHandle,
      businessAvailability:
        parsed.businessAvailability || defaultSiteSettings.businessAvailability,
    } satisfies SiteSettings;
  } catch {
    await writeSiteSettings(defaultSiteSettings);
    return defaultSiteSettings;
  }
}

export async function writeSiteSettings(input: SiteSettings) {
  await ensureDataDir();

  const normalized: SiteSettings = {
    contactEmail: input.contactEmail.trim(),
    supportEmail: input.supportEmail.trim(),
    instagramHandle: input.instagramHandle.trim(),
    businessAvailability: input.businessAvailability.trim(),
  };

  await writeFile(siteSettingsFile, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
}

