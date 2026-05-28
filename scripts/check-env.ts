import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

type EnvCheck = {
  key: string;
  required: boolean;
  description: string;
};

const checks: EnvCheck[] = [
  { key: "NEXT_PUBLIC_APP_URL", required: true, description: "URL base dell'app per redirect, metadata e callback." },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", required: true, description: "Chiave pubblica Stripe per aprire Checkout lato client." },
  { key: "STRIPE_SECRET_KEY", required: true, description: "Chiave segreta Stripe per creare sessioni checkout lato server." },
  { key: "STRIPE_WEBHOOK_SECRET", required: false, description: "Secret webhook Stripe per sincronizzare ordini e subscriptions." },
  { key: "STRIPE_PRICE_STARTER", required: false, description: "Price ID Stripe del piano Starter." },
  { key: "STRIPE_PRICE_PRO", required: false, description: "Price ID Stripe del piano Pro." },
  { key: "STRIPE_PRICE_AGENCY", required: false, description: "Price ID Stripe del piano Agency." },
  { key: "NEXT_PUBLIC_SUPABASE_URL", required: true, description: "URL del progetto Supabase usato da auth e database." },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, description: "Anon key Supabase per login e query lato app." },
  { key: "SUPABASE_SERVICE_ROLE_KEY", required: false, description: "Chiave admin Supabase per task server privilegiati." },
  { key: "OPENAI_API_KEY", required: true, description: "Chiave OpenAI per caption, Reel e promo generator." },
  { key: "RESEND_API_KEY", required: false, description: "Chiave Resend per invio email lead magnet e notifiche." },
  { key: "ADMIN_PASSWORD", required: true, description: "Password della dashboard admin." },
  { key: "NEXT_PUBLIC_GA_ID", required: false, description: "Measurement ID di Google Analytics 4." },
  { key: "NEXT_PUBLIC_META_PIXEL_ID", required: false, description: "Pixel ID Meta per tracking marketing." },
];

function parseEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return {} as Record<string, string>;
  }

  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const envMap: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    envMap[key] = value;
  }

  return envMap;
}

function getEnvValue(envMap: Record<string, string>, key: string) {
  const runtimeValue = process.env[key]?.trim();
  if (runtimeValue) {
    return runtimeValue;
  }

  return envMap[key]?.trim() || "";
}

const workspaceRoot = process.cwd();
const localEnvPath = path.join(workspaceRoot, ".env.local");
const exampleEnvPath = path.join(workspaceRoot, ".env.example");
const exampleValues = parseEnvFile(exampleEnvPath);
const localValues = parseEnvFile(localEnvPath);
const resolvedEnv = { ...exampleValues, ...localValues };

console.log("Controllo variabili ambiente BizKit AI\n");
console.log(`File letto: ${existsSync(localEnvPath) ? ".env.local" : ".env.local non trovato, uso fallback da .env.example"}\n`);

let missingRequired = 0;

for (const check of checks) {
  const value = getEnvValue(resolvedEnv, check.key);
  const isPresent = Boolean(value);
  const status = isPresent ? "OK" : check.required ? "MANCANTE" : "OPZIONALE";

  if (!isPresent && check.required) {
    missingRequired += 1;
  }

  console.log(`${status.padEnd(10)} ${check.key}`);
  console.log(`           ${check.description}`);
}

console.log("");

if (missingRequired > 0) {
  console.log(`Configurazione incompleta: mancano ${missingRequired} variabili obbligatorie.`);
  process.exitCode = 1;
} else {
  console.log("Configurazione base OK: tutte le variabili obbligatorie sono presenti.");
}
