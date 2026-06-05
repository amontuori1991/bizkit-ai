import fs from "node:fs/promises";
import path from "node:path";
import XLSX from "xlsx";
import AdmZip from "adm-zip";

const root = process.cwd();

function buildWorkbook({ title, subtitle, planLabel, examplePlan, notesExample }) {
  const workbook = XLSX.utils.book_new();

  const importRows = [
    [title],
    [subtitle],
    [],
    ["name", "email", "phone", "membership_plan", "status", "notes"],
    ["Mario Rossi", "mario@example.com", "+39 333 1234567", examplePlan, "lead", notesExample],
  ];

  for (let index = 0; index < 20; index += 1) {
    importRows.push(["", "", "", "", "", ""]);
  }

  const instructionsRows = [
    ["Come usare il template"],
    [
      "Compila una riga per ogni contatto e importa il file dal CRM BizKit AI. Mantieni la prima riga con gli header esattamente come nel template.",
    ],
    [],
    ["Campo", "Uso consigliato"],
    ["name", "Nome del contatto o cliente"],
    ["email", "Email principale"],
    ["phone", "Telefono o WhatsApp"],
    ["membership_plan", `${planLabel} attuale o proposta commerciale`],
    ["status", "lead, attivo, follow-up, inattivo"],
    ["notes", "Note operative, preferenze, dettagli prenotazione o trattamento"],
  ];

  const importSheet = XLSX.utils.aoa_to_sheet(importRows);
  importSheet["!cols"] = [
    { wch: 24 },
    { wch: 28 },
    { wch: 18 },
    { wch: 28 },
    { wch: 16 },
    { wch: 42 },
  ];
  importSheet["!merges"] = [
    XLSX.utils.decode_range("A1:F1"),
    XLSX.utils.decode_range("A2:F2"),
  ];

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsRows);
  instructionsSheet["!cols"] = [
    { wch: 20 },
    { wch: 48 },
  ];
  instructionsSheet["!merges"] = [
    XLSX.utils.decode_range("A1:B1"),
    XLSX.utils.decode_range("A2:B2"),
  ];

  XLSX.utils.book_append_sheet(workbook, importSheet, "Import CRM");
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Istruzioni");

  return workbook;
}

async function writeTemplate({
  folder,
  zipName,
  fileName,
  title,
  subtitle,
  planLabel,
  examplePlan,
  notesExample,
}) {
  const workbook = buildWorkbook({
    title,
    subtitle,
    planLabel,
    examplePlan,
    notesExample,
  });

  const outputDir = path.join(root, "public", "downloads", folder);
  const outputPath = path.join(outputDir, fileName);

  await fs.mkdir(outputDir, { recursive: true });
  XLSX.writeFile(workbook, outputPath);

  const zip = new AdmZip();
  zip.addLocalFolder(outputDir);
  zip.writeZip(path.join(root, "public", "downloads", zipName));

  return outputPath;
}

const outputs = await Promise.all([
  writeTemplate({
    folder: "ai-kit-per-palestre",
    zipName: "ai-kit-per-palestre.zip",
    fileName: "template-import-contatti-palestre.xlsx",
    title: "Template Import CRM - Palestre",
    subtitle:
      "Usa questo file per importare rapidamente lead e clienti nel CRM BizKit AI per fitness, palestre e personal trainer.",
    planLabel: "Abbonamento / piano",
    examplePlan: "Mensile premium",
    notesExample: "Lead open day, interessato a prova gratuita da 7 giorni.",
  }),
  writeTemplate({
    folder: "ai-kit-per-parrucchieri",
    zipName: "ai-kit-per-parrucchieri.zip",
    fileName: "template-import-contatti-parrucchieri.xlsx",
    title: "Template Import CRM - Parrucchieri",
    subtitle:
      "Usa questo file per importare clienti, trattamenti e note commerciali nel CRM BizKit AI per saloni, barber shop e hair stylist.",
    planLabel: "Servizio / trattamento",
    examplePlan: "Balayage + piega",
    notesExample: "Cliente colore, preferisce appuntamenti venerdi pomeriggio.",
  }),
  writeTemplate({
    folder: "ai-kit-per-centri-sportivi-outdoor",
    zipName: "ai-kit-per-centri-sportivi-outdoor.zip",
    fileName: "template-import-contatti-centri-sportivi.xlsx",
    title: "Template Import CRM - Sport & Outdoor",
    subtitle:
      "Usa questo file per importare contatti, gruppi, pacchetti ed esperienze nel CRM BizKit AI per sport center e attivita outdoor.",
    planLabel: "Pacchetto / esperienza",
    examplePlan: "Weekend gruppi paintball",
    notesExample: "Richiesta per 12 partecipanti, preferenza sabato mattina, caparra da confermare.",
  }),
]);

console.log(outputs.join("\\n"));
