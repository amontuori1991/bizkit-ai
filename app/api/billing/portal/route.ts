import { NextResponse } from "next/server";
import { isStripeCheckoutConfigured, isSupabaseConfigured } from "@/lib/env";
import { getRequestOrigin } from "@/lib/site";
import { getStripeServer } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MANAGEABLE_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
]);

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase non configurato. Il billing richiede autenticazione utenti." },
        { status: 503 },
      );
    }

    if (!isStripeCheckoutConfigured()) {
      return NextResponse.json(
        { error: "Stripe non configurato. Il Customer Portal non e disponibile." },
        { status: 503 },
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase non disponibile." }, { status: 503 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Effettua il login per gestire l'abbonamento." },
        { status: 401 },
      );
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription || !MANAGEABLE_STATUSES.has(subscription.status)) {
      return NextResponse.json(
        {
          error: "Non risulta un abbonamento attivo o gestibile. Scegli un piano per continuare.",
          code: "no_active_subscription",
        },
        { status: 400 },
      );
    }

    const stripeCustomerId = subscription.stripe_customer_id;
    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          error: "Stripe customer non disponibile per questa subscription. Contatta il supporto.",
          code: "missing_customer",
        },
        { status: 409 },
      );
    }

    const stripe = getStripeServer();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe non disponibile." },
        { status: 503 },
      );
    }

    const origin = getRequestOrigin(request);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/dashboard/billing`,
    });

    if (!portalSession.url) {
      return NextResponse.json(
        { error: "Customer Portal non disponibile." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: "Errore durante l'apertura del Customer Portal." },
      { status: 500 },
    );
  }
}
