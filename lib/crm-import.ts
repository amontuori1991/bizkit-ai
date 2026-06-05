import * as XLSX from "xlsx";

export type CrmImportRow = {
  name: string;
  email: string | null;
  phone: string | null;
  membership_plan: string | null;
  status: string;
  notes: string | null;
};

const HEADER_ALIASES: Record<string, keyof CrmImportRow> = {
  name: "name",
  nome: "name",
  nomecliente: "name",
  nomecontatto: "name",
  cliente: "name",
  contatto: "name",
  email: "email",
  mail: "email",
  telefono: "phone",
  phone: "phone",
  cellulare: "phone",
  whatsapp: "phone",
  piano: "membership_plan",
  abbonamento: "membership_plan",
  membershipplan: "membership_plan",
  servizio: "membership_plan",
  trattamento: "membership_plan",
  pacchetto: "membership_plan",
  esperienza: "membership_plan",
  tipoprenotazione: "membership_plan",
  status: "status",
  stato: "status",
  notes: "notes",
  note: "notes",
  noteoperative: "notes",
  appunti: "notes",
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function sanitizeText(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function normalizeStatus(value: string | null) {
  const normalized = (value ?? "lead")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["attivo", "active", "cliente"].includes(normalized)) {
    return "attivo";
  }

  if (["followup", "follow-up", "follow_up"].includes(normalized)) {
    return "follow-up";
  }

  if (["inattivo", "inactive"].includes(normalized)) {
    return "inattivo";
  }

  return "lead";
}

export function parseCrmImportFile(buffer: ArrayBuffer, fileName?: string | null) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { rows: [] as CrmImportRow[], skippedRows: 0 };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
  });

  const rows: CrmImportRow[] = [];
  let skippedRows = 0;

  for (const record of records) {
    const mapped: Partial<CrmImportRow> = {};

    for (const [rawHeader, rawValue] of Object.entries(record)) {
      const field = HEADER_ALIASES[normalizeHeader(rawHeader)];
      if (!field) {
        continue;
      }

      mapped[field] = sanitizeText(rawValue) as never;
    }

    if (!mapped.name) {
      skippedRows += 1;
      continue;
    }

    rows.push({
      name: mapped.name,
      email: mapped.email ?? null,
      phone: mapped.phone ?? null,
      membership_plan: mapped.membership_plan ?? null,
      status: normalizeStatus(mapped.status ?? null),
      notes: mapped.notes ?? null,
    });
  }

  if (rows.length === 0 && fileName?.toLowerCase().endsWith(".csv")) {
    return { rows: [] as CrmImportRow[], skippedRows };
  }

  return { rows, skippedRows };
}
