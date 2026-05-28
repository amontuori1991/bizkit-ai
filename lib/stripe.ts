import Stripe from "stripe";
import { env, isStripeCheckoutConfigured } from "@/lib/env";

export const STRIPE_PRODUCT = {
  name: "AI Kit per Palestre",
  slug: "ai-kit-per-palestre",
  amount: 2900,
  currency: "eur",
  description:
    "Kit digitale premium con prompt, contenuti, template WhatsApp e fogli operativi per palestre e personal trainer.",
} as const;

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
