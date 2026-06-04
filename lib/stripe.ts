import Stripe from "stripe";
import { env, isStripeCheckoutConfigured } from "@/lib/env";

export type StripeDigitalProduct = {
  name: string;
  slug: string;
  amount: number;
  currency: "eur";
  description: string;
  successCategory: string;
  supportLabel: string;
};

export const STRIPE_PRODUCTS: StripeDigitalProduct[] = [
  {
    name: "AI Kit per Palestre",
    slug: "ai-kit-per-palestre",
    amount: 2900,
    currency: "eur",
    description:
      "Kit digitale premium con prompt, contenuti, template WhatsApp e fogli operativi per palestre e personal trainer.",
    successCategory: "Fitness",
    supportLabel: "fitness",
  },
  {
    name: "AI Kit per Parrucchieri",
    slug: "ai-kit-per-parrucchieri",
    amount: 2900,
    currency: "eur",
    description:
      "Kit digitale premium per saloni parrucchieri, barber shop e hair stylist con prompt, promo, caption e messaggi clienti orientati al booking.",
    successCategory: "Beauty",
    supportLabel: "hair",
  },
  {
    name: "AI Kit Centri Sportivi & Outdoor",
    slug: "ai-kit-per-centri-sportivi-outdoor",
    amount: 2900,
    currency: "eur",
    description:
      "Kit digitale premium per paintball, padel, calcetto, tennis, go kart e attivita outdoor con prompt, promo, caption e messaggi clienti orientati a prenotazione.",
    successCategory: "Sport & Outdoor",
    supportLabel: "sports",
  },
] as const;

export const STRIPE_PRODUCTS_BY_SLUG = Object.fromEntries(
  STRIPE_PRODUCTS.map((product) => [product.slug, product]),
) as Record<string, StripeDigitalProduct>;

export function getStripeProductBySlug(slug?: string | null) {
  if (!slug) {
    return null;
  }

  return STRIPE_PRODUCTS_BY_SLUG[slug] ?? null;
}

let stripeInstance: Stripe | null = null;

export function getStripeServer() {
  if (!isStripeCheckoutConfigured()) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(env.stripeSecretKey);
  }

  return stripeInstance;
}
