import type Stripe from "stripe";
import { env } from "@/lib/env";
import type { PaidPlanId } from "@/lib/plan-limits";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

type SyncOptions = {
  customerEmailHint?: string | null;
  planIdHint?: PaidPlanId | null;
  sourceEvent?: string;
  userIdHint?: string | null;
};

type SyncedSubscriptionResult = {
  planId: PaidPlanId;
  status: string;
  stripeCustomerId: string | null;
  userId: string;
};

function isPaidPlanId(value?: string | null): value is PaidPlanId {
  return value === "starter" || value === "pro" || value === "agency";
}

function toIsoTimestamp(unixSeconds?: number | null) {
  return typeof unixSeconds === "number" ? new Date(unixSeconds * 1000).toISOString() : null;
}

function getStripeCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
) {
  if (!customer) {
    return null;
  }

  return typeof customer === "string" ? customer : customer.id;
}

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const firstItem = subscription.items.data[0];

  return {
    currentPeriodStart: firstItem?.current_period_start ?? null,
    currentPeriodEnd: firstItem?.current_period_end ?? null,
  };
}

function shouldKeepPaidPlan(status: string) {
  return status === "active" || status === "trialing" || status === "past_due";
}

export function mapStripePriceToPlan(priceId?: string | null): PaidPlanId | null {
  if (!priceId) {
    return null;
  }

  if (priceId === env.stripePriceStarter) {
    return "starter";
  }

  if (priceId === env.stripePricePro) {
    return "pro";
  }

  if (priceId === env.stripePriceAgency) {
    return "agency";
  }

  return null;
}

export function getStripeSubscriptionPriceId(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price?.id ?? null;
}

async function resolveUserIdForSubscription(
  stripeSubscriptionId: string,
  stripeCustomerId: string | null,
  userIdHint?: string | null,
) {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    throw new Error("Supabase service role non configurato.");
  }

  if (userIdHint) {
    return userIdHint;
  }

  const { data: bySubscription, error: subscriptionLookupError } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  if (subscriptionLookupError) {
    throw subscriptionLookupError;
  }

  if (bySubscription?.user_id) {
    return bySubscription.user_id;
  }

  if (!stripeCustomerId) {
    return null;
  }

  const { data: byCustomer, error: customerLookupError } = await supabase
    .from("customers")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (customerLookupError) {
    throw customerLookupError;
  }

  return byCustomer?.user_id ?? null;
}

async function upsertStripeCustomer(input: {
  stripeCustomerId: string | null;
  userId: string;
  email?: string | null;
}) {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    throw new Error("Supabase service role non configurato.");
  }

  if (!input.stripeCustomerId) {
    return null;
  }

  const { data, error } = await supabase
    .from("customers")
    .upsert(
      {
        user_id: input.userId,
        stripe_customer_id: input.stripeCustomerId,
        email: input.email ?? null,
      },
      { onConflict: "stripe_customer_id" },
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

export async function syncStripeSubscription(
  subscription: Stripe.Subscription,
  options: SyncOptions = {},
): Promise<SyncedSubscriptionResult> {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    throw new Error("Supabase service role non configurato.");
  }

  const priceId = getStripeSubscriptionPriceId(subscription);
  const stripeCustomerId = getStripeCustomerId(subscription.customer);
  const metadataUserId = typeof subscription.metadata?.userId === "string" ? subscription.metadata.userId : null;
  const metadataPlanId = isPaidPlanId(subscription.metadata?.planId) ? subscription.metadata.planId : null;
  const planId = mapStripePriceToPlan(priceId) ?? options.planIdHint ?? metadataPlanId;
  const period = getSubscriptionPeriod(subscription);

  if (!planId) {
    throw new Error(
      `Impossibile mappare il price Stripe a un piano interno. priceId=${priceId ?? "null"}`,
    );
  }

  const userId = await resolveUserIdForSubscription(
    subscription.id,
    stripeCustomerId,
    metadataUserId ?? options.userIdHint ?? null,
  );

  if (!userId) {
    throw new Error(
      `Impossibile risolvere user_id per la subscription ${subscription.id} (${options.sourceEvent ?? "unknown_event"}).`,
    );
  }

  const customerId = await upsertStripeCustomer({
    stripeCustomerId,
    userId,
    email: options.customerEmailHint ?? null,
  });

  const payload = {
    user_id: userId,
    customer_id: customerId,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan_id: planId,
    status: subscription.status,
    current_period_start: toIsoTimestamp(period.currentPeriodStart),
    current_period_end: toIsoTimestamp(period.currentPeriodEnd),
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
  };

  const { error: subscriptionError } = await supabase
    .from("subscriptions")
    .upsert(payload, { onConflict: "stripe_subscription_id" });

  if (subscriptionError) {
    throw subscriptionError;
  }

  const runtimeTier = shouldKeepPaidPlan(subscription.status) ? planId : "free";
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      subscription_tier: runtimeTier,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    throw profileError;
  }

  return {
    planId,
    status: subscription.status,
    stripeCustomerId,
    userId,
  };
}
