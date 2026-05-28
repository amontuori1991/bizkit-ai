const fs = require("node:fs");
const path = require("node:path");
const PDFDocument = require("pdfkit");
const AdmZip = require("adm-zip");
const XLSX = require("xlsx");

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "private-assets", "ai-kit-per-palestre-source");
const publicKitDir = path.join(projectRoot, "public", "downloads", "ai-kit-per-palestre");
const secureDir = path.join(projectRoot, ".secure-downloads");
const secureBundleDir = path.join(secureDir, "ai-kit-per-palestre");
const zipPath = path.join(secureDir, "ai-kit-per-palestre.zip");
const freebieSourceDir = path.join(projectRoot, "private-assets", "freebies");
const publicFreebiesDir = path.join(projectRoot, "public", "downloads", "freebies");

const markdownToPdfMap = [
  ["guida-ai-kit-palestre.md", "guida-ai-kit-palestre.pdf", "Guida AI Kit per Palestre"],
  ["prompt-chatgpt-palestre.md", "prompt-chatgpt-palestre.pdf", "100 Prompt ChatGPT per Palestre"],
  ["messaggi-whatsapp-template.md", "messaggi-whatsapp-template.pdf", "Template WhatsApp per Palestre"],
  ["offerte-promozionali.md", "offerte-promozionali.pdf", "20 Offerte Promozionali per Palestre"],
  ["free-preview.md", "free-preview.pdf", "Preview Gratuita - AI Kit per Palestre"],
];

const textToPdfMap = [["README.txt", "README.pdf", "README del Pacchetto"]];

const csvToXlsxMap = [
  ["calendario-editoriale-30-giorni.csv", "calendario-editoriale-30-giorni.xlsx", "Calendario 30 Giorni"],
  ["idee-reel-30-giorni.csv", "idee-reel-30-giorni.xlsx", "30 Idee Reel"],
  ["caption-instagram-30.csv", "caption-instagram-30.xlsx", "30 Caption"],
  ["gestione-clienti.csv", "gestione-clienti.xlsx", "Gestione Clienti"],
  ["gestione-abbonamenti.csv", "gestione-abbonamenti.xlsx", "Gestione Abbonamenti"],
];

if (!fs.existsSync(sourceDir)) {
  console.error(`Cartella sorgente del kit non trovata: ${sourceDir}`);
  process.exit(1);
}

function normalizeLine(line) {
  return line
    .replace(/\r/g, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/^###\s*/, "")
    .replace(/^##\s*/, "")
    .replace(/^#\s*/, "")
    .trim();
}

function writePdfFromText(inputPath, outputPath, title) {
  const rawText = fs.readFileSync(inputPath, "utf8");
  const lines = rawText.split("\n");
  const doc = new PDFDocument({
    size: "A4",
    margin: 56,
    info: {
      Title: title,
      Author: "BizKit AI",
      Subject: "Kit digitale premium per palestre",
    },
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc.roundedRect(0, 0, doc.page.width, 170, 0).fill("#0F172A");
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(28)
    .text(title, 56, 58, { width: pageWidth });
  doc
    .fillColor("#BFDBFE")
    .font("Helvetica")
    .fontSize(12)
    .text("BizKit AI • Professional Toolkit", 56, 118);

  doc.y = 196;

  for (const originalLine of lines) {
    const line = originalLine.replace(/\r/g, "");

    if (!line.trim()) {
      doc.moveDown(0.6);
      continue;
    }

    if (doc.y > 740) {
      doc.addPage();
    }

    if (line.startsWith("# ")) {
      doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(24).text(normalizeLine(line), {
        width: pageWidth,
      });
      doc.moveDown(0.5);
      continue;
    }

    if (line.startsWith("## ")) {
      doc.fillColor("#1D4ED8").font("Helvetica-Bold").fontSize(18).text(normalizeLine(line), {
        width: pageWidth,
      });
      doc.moveDown(0.35);
      continue;
    }

    if (line.startsWith("### ")) {
      doc.fillColor("#111827").font("Helvetica-Bold").fontSize(14).text(normalizeLine(line), {
        width: pageWidth,
      });
      doc.moveDown(0.25);
      continue;
    }

    if (line.startsWith("- ") || /^\d+\./.test(line)) {
      doc.fillColor("#1F2937").font("Helvetica").fontSize(11.5).text(`• ${normalizeLine(line)}`, {
        width: pageWidth - 12,
        indent: 10,
      });
      continue;
    }

    doc.fillColor("#334155").font("Helvetica").fontSize(11.5).text(normalizeLine(line), {
      width: pageWidth,
      lineGap: 2,
    });
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

function createXlsxFromCsv(inputPath, outputPath, sheetName) {
  const raw = fs.readFileSync(inputPath, "utf8");
  const workbook = XLSX.read(raw, { type: "string" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  for (let col = range.s.c; col <= range.e.c; col += 1) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (sheet[cellAddress]) {
      sheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1D4ED8" } },
      };
    }
  }

  sheet["!autofilter"] = { ref: sheet["!ref"] };
  sheet["!cols"] = new Array(range.e.c + 1).fill({ wch: 24 });

  const nextWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(nextWorkbook, sheet, sheetName);
  XLSX.writeFile(nextWorkbook, outputPath);
}

async function buildAssets() {
  fs.mkdirSync(secureDir, { recursive: true });
  fs.mkdirSync(secureBundleDir, { recursive: true });
  fs.mkdirSync(publicFreebiesDir, { recursive: true });

  for (const [input, output, title] of markdownToPdfMap) {
    const outputDir = input === "free-preview.md" ? publicKitDir : secureBundleDir;
    await writePdfFromText(path.join(sourceDir, input), path.join(outputDir, output), title);
  }

  for (const [input, output, title] of textToPdfMap) {
    await writePdfFromText(path.join(sourceDir, input), path.join(secureBundleDir, output), title);
  }

  for (const [input, output, sheetName] of csvToXlsxMap) {
    createXlsxFromCsv(path.join(sourceDir, input), path.join(secureBundleDir, output), sheetName);
  }

  const zip = new AdmZip();
  zip.addLocalFolder(secureBundleDir, "ai-kit-per-palestre");
  zip.writeZip(zipPath);

  await writePdfFromText(
    path.join(freebieSourceDir, "10-prompt-ai-gratis-per-palestre.md"),
    path.join(publicFreebiesDir, "10-prompt-ai-gratis-per-palestre.pdf"),
    "10 Prompt AI Gratis per Palestre",
  );
}

buildAssets()
  .then(() => {
    console.log(`Kit premium generato con successo in: ${zipPath}`);
  })
  .catch((error) => {
    console.error("Errore durante la generazione del kit premium:", error);
    process.exit(1);
  });
