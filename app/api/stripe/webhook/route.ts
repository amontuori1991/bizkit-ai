import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { env, isStripeCheckoutConfigured } from "@/lib/env";
import { getStripeServer } from "@/lib/stripe";
import { syncStripeSubscription } from "@/lib/stripe-subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getStripeSubscription(
  stripe: NonNullable<ReturnType<typeof getStripeServer>>,
  subscriptionId: string,
) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

async function handleCheckoutSessionCompleted(
  stripe: NonNullable<ReturnType<typeof getStripeServer>>,
  session: Stripe.Checkout.Session,
) {
  if (session.mode !== "subscription") {
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  if (!subscriptionId) {
    throw new Error("checkout.session.completed senza subscription associata.");
  }

  const userIdHint =
    typeof session.metadata?.userId === "string" ? session.metadata.userId : null;
  const planIdHint =
    session.metadata?.planId === "starter" ||
    session.metadata?.planId === "pro" ||
    session.metadata?.planId === "agency"
      ? session.metadata.planId
      : null;

  const subscription = await getStripeSubscription(stripe, subscriptionId);
  await syncStripeSubscription(subscription, {
    customerEmailHint: session.customer_details?.email ?? session.customer_email ?? null,
    planIdHint,
    sourceEvent: "checkout.session.completed",
    userIdHint,
  });
}

async function handleSubscriptionEvent(
  subscription: Stripe.Subscription,
  sourceEvent: string,
) {
  await syncStripeSubscription(subscription, { sourceEvent });
}

async function handleInvoiceEvent(
  stripe: NonNullable<ReturnType<typeof getStripeServer>>,
  invoice: Stripe.Invoice,
  sourceEvent: string,
) {
  const parentSubscription = invoice.parent?.subscription_details?.subscription;
  const subscriptionId =
    typeof parentSubscription === "string"
      ? parentSubscription
      : parentSubscription?.id ?? null;

  if (!subscriptionId) {
    console.warn(`Stripe webhook ${sourceEvent}: invoice senza subscription associata.`);
    return;
  }

  const subscription = await getStripeSubscription(stripe, subscriptionId);
  await syncStripeSubscription(subscription, {
    customerEmailHint: invoice.customer_email ?? null,
    sourceEvent,
  });
}

export async function POST(request: Request) {
  try {
    if (!isStripeCheckoutConfigured()) {
      return NextResponse.json(
        { error: "Stripe non configurato." },
        { status: 503 },
      );
    }

    if (!env.stripeWebhookSecret) {
      return NextResponse.json(
        { error: "STRIPE_WEBHOOK_SECRET non configurato." },
        { status: 503 },
      );
    }

    const stripeSignature = request.headers.get("stripe-signature");
    if (!stripeSignature) {
      return NextResponse.json(
        { error: "Header stripe-signature mancante." },
        { status: 400 },
      );
    }

    const rawBody = await request.text();
    const stripe = getStripeServer();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe server non disponibile." },
        { status: 503 },
      );
    }

    const event = stripe.webhooks.constructEvent(
      rawBody,
      stripeSignature,
      env.stripeWebhookSecret,
    );

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          stripe,
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(
          event.data.object as Stripe.Subscription,
          event.type,
        );
        break;
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        await handleInvoiceEvent(
          stripe,
          event.data.object as Stripe.Invoice,
          event.type,
        );
        break;
      default:
        console.log(`Stripe webhook ignorato: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      (error as { type?: string }).type === "StripeSignatureVerificationError"
    ) {
      return NextResponse.json(
        { error: "Firma webhook Stripe non valida." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Errore durante la gestione del webhook Stripe." },
      { status: 500 },
    );
  }
}
