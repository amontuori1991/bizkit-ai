import { products } from "@/data/products";
import { env, isResendConfigured } from "@/lib/env";
import { PLAN_LIMITS, type PaidPlanId } from "@/lib/plan-limits";
import { sendEmail } from "@/lib/resend";
import { readSiteSettings } from "@/lib/site-settings";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export type EmailLogStatus = "sent" | "disabled" | "failed" | "skipped";
export type EmailLogType =
  | "welcome"
  | "subscription_activated"
  | "kit_purchase"
  | "welcome_test"
  | "subscription_test"
  | "kit_test";

type EmailTemplateConfig = {
  id: EmailLogType;
  label: string;
};

type BaseTransactionalEmailInput = {
  userId?: string | null;
  email: string;
};

type SendWelcomeEmailInput = BaseTransactionalEmailInput & {
  fullName?: string | null;
  logType?: EmailLogType;
};

type SendSubscriptionEmailInput = BaseTransactionalEmailInput & {
  planId: PaidPlanId;
  logType?: EmailLogType;
};

type SendKitPurchaseEmailInput = BaseTransactionalEmailInput & {
  productSlug: string;
  productName?: string | null;
  logType?: EmailLogType;
};

type SendTransactionalEmailArgs = BaseTransactionalEmailInput & {
  type: EmailLogType;
  subject: string;
  preheader: string;
  title: string;
  body: string[];
  ctaLabel: string;
  ctaHref: string;
  footer?: string[];
};

const BRAND_NAME = "BizKit AI";
const BRAND_TAGLINE = "AI Marketing Platform for Local Businesses";

const EMAIL_TEMPLATES: EmailTemplateConfig[] = [
  { id: "welcome", label: "Welcome email" },
  { id: "subscription_activated", label: "Subscription activated" },
  { id: "kit_purchase", label: "Digital kit purchase" },
];

export function getActiveEmailTemplates() {
  return EMAIL_TEMPLATES;
}

export function getActiveEmailTemplateCount() {
  return EMAIL_TEMPLATES.length;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getLogoUrl() {
  return `${env.appUrl.replace(/\/$/, "")}/icon.png`;
}

function buildEmailHtml(input: Omit<SendTransactionalEmailArgs, "type" | "userId" | "email">) {
  const bodyHtml = input.body
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#475569;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  const footerHtml = (input.footer ?? [
    "Puoi gestire tutto dalla tua dashboard BizKit AI in qualsiasi momento.",
    "Se hai bisogno di supporto, rispondi a questa email oppure contattaci direttamente.",
  ])
    .map(
      (paragraph) =>
        `<p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#64748b;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  return `
    <div style="margin:0;padding:32px 16px;background:#eef4ff;font-family:Arial,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbe5f4;border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,0.08);">
        <div style="padding:32px 32px 20px;background:linear-gradient(135deg,#0b1022 0%,#1d2d62 65%,#2563eb 100%);">
          <img src="${getLogoUrl()}" alt="${BRAND_NAME}" width="72" height="72" style="display:block;width:72px;height:72px;border-radius:18px;" />
          <div style="margin-top:18px;">
            <p style="margin:0;font-size:22px;line-height:1.2;font-weight:700;color:#ffffff;">${BRAND_NAME}</p>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.78);">${BRAND_TAGLINE}</p>
          </div>
        </div>
        <div style="padding:32px;">
          <h1 style="margin:0 0 18px;font-size:32px;line-height:1.15;color:#0f172a;">${escapeHtml(input.title)}</h1>
          ${bodyHtml}
          <div style="margin:28px 0 28px;">
            <a href="${escapeHtml(input.ctaHref)}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;box-shadow:0 10px 24px rgba(37,99,235,0.25);">
              ${escapeHtml(input.ctaLabel)}
            </a>
          </div>
          <div style="padding-top:20px;border-top:1px solid #e2e8f0;">
            ${footerHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}

async function writeEmailLog(input: {
  userId?: string | null;
  email: string;
  type: string;
  status: EmailLogStatus;
  provider?: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("email_logs").insert({
    user_id: input.userId ?? null,
    email: input.email,
    type: input.type,
    status: input.status,
    provider: input.provider ?? "resend",
  });

  if (error) {
    console.error("Email log write error:", error);
  }
}

async function hasEmailLog(input: {
  userId?: string | null;
  email: string;
  type: string;
  statuses?: EmailLogStatus[];
}) {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return false;
  }

  let query = supabase
    .from("email_logs")
    .select("id", { head: true, count: "exact" })
    .eq("type", input.type);

  if (input.userId) {
    query = query.eq("user_id", input.userId);
  } else {
    query = query.eq("email", input.email);
  }

  if (input.statuses && input.statuses.length > 0) {
    query = query.in("status", input.statuses);
  }

  const { count, error } = await query.limit(1);

  if (error) {
    console.error("Email log lookup error:", error);
    return false;
  }

  return (count ?? 0) > 0;
}

async function sendTransactionalEmail(input: SendTransactionalEmailArgs) {
  const html = buildEmailHtml({
    subject: input.subject,
    preheader: input.preheader,
    title: input.title,
    body: input.body,
    ctaLabel: input.ctaLabel,
    ctaHref: input.ctaHref,
    footer: input.footer,
  });

  if (!isResendConfigured()) {
    console.warn(`[email] RESEND_API_KEY mancante. Invio ${input.type} disattivato.`);
    await writeEmailLog({
      userId: input.userId,
      email: input.email,
      type: input.type,
      status: "disabled",
    });
    return { success: false, disabled: true };
  }

  try {
    await sendEmail({
      to: input.email,
      subject: input.subject,
      html,
      from: `${BRAND_NAME} <onboarding@resend.dev>`,
    });

    await writeEmailLog({
      userId: input.userId,
      email: input.email,
      type: input.type,
      status: "sent",
    });

    return { success: true, disabled: false };
  } catch (error) {
    console.error(`[email] Invio ${input.type} fallito:`, error);
    await writeEmailLog({
      userId: input.userId,
      email: input.email,
      type: input.type,
      status: "failed",
    });

    return { success: false, disabled: false, error };
  }
}

function formatLimit(value: number | null) {
  return value === null ? "illimitato" : String(value);
}

function getProductNameBySlug(slug: string, fallback?: string | null) {
  return products.find((product) => product.slug === slug)?.name ?? fallback ?? "Kit BizKit AI";
}

export async function sendWelcomeEmail(input: SendWelcomeEmailInput) {
  const siteSettings = await readSiteSettings();

  return sendTransactionalEmail({
    userId: input.userId,
    email: input.email,
    type: input.logType ?? "welcome",
    subject: "Benvenuto su BizKit AI 🚀",
    preheader: "Completa il Business Profile e genera il tuo primo contenuto premium.",
    title: `Benvenuto su BizKit AI${input.fullName ? `, ${input.fullName}` : ""}`,
    body: [
      "Hai appena attivato la tua piattaforma AI per marketing, contenuti, CRM e crescita delle attivita locali.",
      "Il passo migliore adesso e completare il tuo Business Profile: in questo modo l'AI usera automaticamente business type, target, servizi, CTA e tono di voce in ogni generazione.",
      "Subito dopo puoi entrare in dashboard e creare il tuo primo contenuto premium per capire il valore reale del prodotto.",
    ],
    ctaLabel: "Vai alla Dashboard",
    ctaHref: `${env.appUrl.replace(/\/$/, "")}/dashboard`,
    footer: [
      "Completa il Business Profile per attivare verticale, quick templates e contesto AI personalizzato.",
      `Per supporto diretto puoi scriverci a ${siteSettings.supportEmail}.`,
    ],
  });
}

export async function ensureWelcomeEmailForUser(input: SendWelcomeEmailInput) {
  const alreadySent = await hasEmailLog({
    userId: input.userId,
    email: input.email,
    type: "welcome",
    statuses: ["sent", "disabled", "skipped"],
  });

  if (alreadySent) {
    return { success: false, skipped: true };
  }

  return sendWelcomeEmail(input);
}

export async function sendSubscriptionEmail(input: SendSubscriptionEmailInput) {
  const plan = PLAN_LIMITS[input.planId];

  return sendTransactionalEmail({
    userId: input.userId,
    email: input.email,
    type: input.logType ?? "subscription_activated",
    subject: "Il tuo piano BizKit AI e attivo ✅",
    preheader: `Il piano ${plan.label} e attivo con limiti e strumenti sbloccati.`,
    title: `Il tuo piano ${plan.label} e attivo`,
    body: [
      `Abbiamo confermato l'attivazione del tuo abbonamento ${plan.label} su BizKit AI.`,
      `Da ora hai accesso a ${plan.aiDailyCredits} crediti AI al giorno, ${formatLimit(plan.savedContents)} contenuti salvati, ${formatLimit(plan.calendars)} calendari e ${formatLimit(plan.crmClients)} clienti CRM.`,
      "Dalla pagina Billing puoi controllare il piano attuale, lo stato della subscription e aprire il Customer Portal per modifiche, upgrade, downgrade o cancellazione a fine periodo.",
    ],
    ctaLabel: "Gestisci il tuo abbonamento",
    ctaHref: `${env.appUrl.replace(/\/$/, "")}/dashboard/billing`,
    footer: [
      "Il Customer Portal Stripe e disponibile dalla tua dashboard billing.",
      "Puoi continuare a usare normalmente la piattaforma, il CRM, i calendari e l'AI Business Coach con i limiti del nuovo piano.",
    ],
  });
}

export async function sendKitPurchaseEmail(input: SendKitPurchaseEmailInput) {
  const productName = getProductNameBySlug(input.productSlug, input.productName);

  return sendTransactionalEmail({
    userId: input.userId,
    email: input.email,
    type: input.logType ?? "kit_purchase",
    subject: "Il tuo kit e pronto da scaricare 🎁",
    preheader: `${productName} e disponibile nella tua area download BizKit AI.`,
    title: "Il tuo kit e pronto da scaricare",
    body: [
      `Il tuo acquisto e stato confermato con successo: ${productName}.`,
      "Abbiamo sbloccato il download del pacchetto completo nella tua area personale, cosi puoi tornare a scaricarlo anche in seguito senza cercare di nuovo il link originale.",
      "Troverai il kit sia nella pagina prodotto sia nella sezione I miei acquisti della dashboard.",
    ],
    ctaLabel: "Scarica il kit",
    ctaHref: `${env.appUrl.replace(/\/$/, "")}/dashboard/purchases`,
    footer: [
      "Se hai acquistato il kit mentre eri loggato, il prodotto viene collegato automaticamente al tuo account.",
      "Per qualsiasi problema con il download contatta il supporto dalla dashboard oppure via email.",
    ],
  });
}
