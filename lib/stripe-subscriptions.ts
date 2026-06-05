import type Stripe from "stripe";
import { sendSubscriptionEmail } from "@/lib/email";
import { env } from "@/lib/env";
import type { PaidPlanId } from "@/lib/plan-limits";
import { trackServerEvent } from "@/lib/server-analytics";
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

type ExistingSubscriptionRow = {
  plan_id: string | null;
  status: string | null;
  cancel_at_period_end?: boolean | null;
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

function shouldSendSubscriptionActivatedEmail(input: {
  previous: ExistingSubscriptionRow | null;
  nextPlanId: PaidPlanId;
  nextStatus: string;
}) {
  const nextIsPaid = input.nextStatus === "active" || input.nextStatus === "trialing";
  if (!nextIsPaid) {
    return false;
  }

  if (!input.previous) {
    return true;
  }

  const previousIsPaid =
    input.previous.status === "active" || input.previous.status === "trialing";

  if (!previousIsPaid) {
    return true;
  }

  return input.previous.plan_id !== input.nextPlanId;
}

function resolveSubscriptionLifecycleEvent(input: {
  previous: ExistingSubscriptionRow | null;
  nextPlanId: PaidPlanId;
  nextStatus: string;
  cancelAtPeriodEnd: boolean;
}) {
  const nextIsPaid = input.nextStatus === "active" || input.nextStatus === "trialing";

  if (input.cancelAtPeriodEnd && input.previous?.cancel_at_period_end !== true) {
    return "subscription_cancelled" as const;
  }

  if (!nextIsPaid) {
    if (input.previous?.status === "active" || input.previous?.status === "trialing") {
      return "subscription_cancelled" as const;
    }

    return null;
  }

  if (!input.previous) {
    return "subscription_started" as const;
  }

  const previousIsPaid =
    input.previous.status === "active" || input.previous.status === "trialing";

  if (!previousIsPaid) {
    return "subscription_started" as const;
  }

  if (input.previous.plan_id !== input.nextPlanId) {
    return "subscription_upgraded" as const;
  }

  return null;
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

  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("plan_id,status,cancel_at_period_end")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle<ExistingSubscriptionRow>();

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

  const lifecycleEvent = resolveSubscriptionLifecycleEvent({
    previous: existingSubscription ?? null,
    nextPlanId: planId,
    nextStatus: subscription.status,
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
  });

  if (lifecycleEvent) {
    try {
      await trackServerEvent({
        eventName: lifecycleEvent,
        userId,
        source: "webhook",
      });
    } catch (error) {
      console.error("Subscription analytics event error:", error);
    }
  }

  if (
    shouldSendSubscriptionActivatedEmail({
      previous: existingSubscription ?? null,
      nextPlanId: planId,
      nextStatus: subscription.status,
    })
  ) {
    const recipientEmail =
      options.customerEmailHint ??
      (
        await supabase.from("profiles").select("email").eq("id", userId).maybeSingle()
      ).data?.email ??
      null;

    if (recipientEmail) {
      try {
        await sendSubscriptionEmail({
          userId,
          email: recipientEmail,
          planId,
        });
      } catch (error) {
        console.error("Subscription activated email error:", error);
      }
    }
  }

  return {
    planId,
    status: subscription.status,
    stripeCustomerId,
    userId,
  };
}
