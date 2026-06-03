type ServiceStatus = {
  configured: boolean;
  missing: string[];
  description: string;
};

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getMissing(required: Array<[value: string, label: string]>) {
  return required.filter(([value]) => !value).map(([, label]) => label);
}

const appUrl = readEnv("NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SITE_URL") || "http://localhost:3000";
const stripePublishableKey = readEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
const stripeSecretKey = readEnv("STRIPE_SECRET_KEY");
const stripeWebhookSecret = readEnv("STRIPE_WEBHOOK_SECRET");
const stripePriceStarter = readEnv("STRIPE_PRICE_STARTER");
const stripePricePro = readEnv("STRIPE_PRICE_PRO");
const stripePriceAgency = readEnv("STRIPE_PRICE_AGENCY");
const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabaseServiceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
const openAiApiKey = readEnv("OPENAI_API_KEY");
const openAiModel = readEnv("OPENAI_MODEL") || "gpt-5.2";
const resendApiKey = readEnv("RESEND_API_KEY");
const adminPassword = readEnv("ADMIN_PASSWORD", "ADMIN_DASHBOARD_PASSWORD");
const gaId = readEnv("NEXT_PUBLIC_GA_ID", "NEXT_PUBLIC_GA_MEASUREMENT_ID");
const metaPixelId = readEnv("NEXT_PUBLIC_META_PIXEL_ID");

export const env = {
  appUrl,
  stripePublishableKey,
  stripeSecretKey,
  stripeWebhookSecret,
  stripePriceStarter,
  stripePricePro,
  stripePriceAgency,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  openAiApiKey,
  openAiModel,
  resendApiKey,
  adminPassword,
  gaId,
  metaPixelId,
};

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isSupabaseAdminConfigured() {
  return Boolean(isSupabaseConfigured() && env.supabaseServiceRoleKey);
}

export function isOpenAIConfigured() {
  return Boolean(env.openAiApiKey);
}

export function isResendConfigured() {
  return Boolean(env.resendApiKey);
}

export function isStripeCheckoutConfigured() {
  return Boolean(env.stripePublishableKey && env.stripeSecretKey);
}

export function isStripeSubscriptionsConfigured() {
  return Boolean(
    isStripeCheckoutConfigured() &&
      env.stripePriceStarter &&
      env.stripePricePro &&
      env.stripePriceAgency,
  );
}

export function isAnalyticsConfigured() {
  return Boolean(env.gaId || env.metaPixelId);
}

export function isAdminPasswordConfigured() {
  return Boolean(env.adminPassword);
}

export function getEnvironmentStatuses(): Record<string, ServiceStatus> {
  return {
    stripe: {
      configured: isStripeCheckoutConfigured(),
      missing: getMissing([
        [env.stripePublishableKey, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
        [env.stripeSecretKey, "STRIPE_SECRET_KEY"],
      ]),
      description: "Serve per checkout reale, pagamenti e download protetti.",
    },
    stripeSubscriptions: {
      configured: isStripeSubscriptionsConfigured(),
      missing: getMissing([
        [env.stripePublishableKey, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
        [env.stripeSecretKey, "STRIPE_SECRET_KEY"],
        [env.stripePriceStarter, "STRIPE_PRICE_STARTER"],
        [env.stripePricePro, "STRIPE_PRICE_PRO"],
        [env.stripePriceAgency, "STRIPE_PRICE_AGENCY"],
      ]),
      description: "Serve per abilitare i piani Starter, Pro e Agency con Stripe subscriptions.",
    },
    stripeWebhook: {
      configured: Boolean(env.stripeWebhookSecret),
      missing: getMissing([[env.stripeWebhookSecret, "STRIPE_WEBHOOK_SECRET"]]),
      description: "Serve per verificare Stripe e sincronizzare automaticamente gli abbonamenti tramite /api/stripe/webhook.",
    },
    supabase: {
      configured: isSupabaseConfigured(),
      missing: getMissing([
        [env.supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"],
        [env.supabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
      ]),
      description: "Serve per autenticazione, dashboard utenti e dati SaaS.",
    },
    supabaseAdmin: {
      configured: isSupabaseAdminConfigured(),
      missing: getMissing([[env.supabaseServiceRoleKey, "SUPABASE_SERVICE_ROLE_KEY"]]),
      description: "Serve per operazioni server privilegiate e automazioni future.",
    },
    openai: {
      configured: isOpenAIConfigured(),
      missing: getMissing([[env.openAiApiKey, "OPENAI_API_KEY"]]),
      description: "Serve per generatori caption, Reel e promo AI.",
    },
    resend: {
      configured: isResendConfigured(),
      missing: getMissing([[env.resendApiKey, "RESEND_API_KEY"]]),
      description: "Serve per invio email transazionali e lead magnet.",
    },
    analytics: {
      configured: isAnalyticsConfigured(),
      missing: getMissing([
        [env.gaId || env.metaPixelId, "NEXT_PUBLIC_GA_ID oppure NEXT_PUBLIC_META_PIXEL_ID"],
      ]),
      description: "Serve per GA4, Meta Pixel e monitoraggio funnel.",
    },
    admin: {
      configured: isAdminPasswordConfigured(),
      missing: getMissing([[env.adminPassword, "ADMIN_PASSWORD"]]),
      description: "Serve per proteggere la dashboard admin con password semplice.",
    },
    app: {
      configured: Boolean(env.appUrl),
      missing: [],
      description: "URL base usato per metadata, redirect e callback locali o production.",
    },
  };
}
