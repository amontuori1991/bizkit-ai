import { NextResponse } from "next/server";
import { env, isStripeSubscriptionsConfigured, isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRequestOrigin } from "@/lib/site";
import { getStripeServer } from "@/lib/stripe";

const priceMap = {
  starter: env.stripePriceStarter,
  pro: env.stripePricePro,
  agency: env.stripePriceAgency,
} as const;

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase non configurato. Il billing richiede autenticazione utenti." },
        { status: 503 },
      );
    }

    if (!isStripeSubscriptionsConfigured()) {
      return NextResponse.json(
        { error: "Stripe subscriptions non configurato. Aggiungi chiavi e Price ID dei piani." },
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

    if (!user?.email) {
      return NextResponse.json({ error: "Effettua il login per attivare un piano." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { planId?: keyof typeof priceMap };
    const planId = body.planId;
    const priceId = planId ? priceMap[planId] : null;

    if (!planId || !priceId) {
      return NextResponse.json({ error: "Piano non configurato." }, { status: 400 });
    }

    const stripe = getStripeServer();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe non configurato." }, { status: 503 });
    }
    const origin = getRequestOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${origin}/dashboard/billing?status=success`,
      cancel_url: `${origin}/dashboard/billing?status=cancel`,
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: {
        planId,
        userId: user.id,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout subscription non disponibile." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ error: "Errore durante il billing." }, { status: 500 });
  }
}
