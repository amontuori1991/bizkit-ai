import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type LeadEntry = {
  email: string;
  source: string;
  createdAt: string;
  asset: "10-prompt-ai-gratis-per-palestre";
};

const leadsDir = path.join(process.cwd(), ".data");
const leadsFile = path.join(leadsDir, "leads.json");

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function ensureLeadStorage() {
  await mkdir(leadsDir, { recursive: true });
}

export async function readLeads() {
  await ensureLeadStorage();

  try {
    const raw = await readFile(leadsFile, "utf8");
    return JSON.parse(raw) as LeadEntry[];
  } catch {
    return [];
  }
}

export async function saveLead(entry: LeadEntry) {
  const leads = await readLeads();
  const alreadyExists = leads.some((lead) => lead.email.toLowerCase() === entry.email.toLowerCase());

  if (!alreadyExists) {
    leads.push(entry);
    await writeFile(leadsFile, JSON.stringify(leads, null, 2), "utf8");
  }

  return { alreadyExists };
}
