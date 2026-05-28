import { NextResponse } from "next/server";
import { isStripeCheckoutConfigured } from "@/lib/env";
import { getStripeServer, STRIPE_PRODUCT } from "@/lib/stripe";
import { getRequestOrigin } from "@/lib/site";

type CheckoutBody = {
  productSlug?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as CheckoutBody;
    if (!isStripeCheckoutConfigured()) {
      return NextResponse.json(
        { error: "Stripe non configurato. Il checkout reale e temporaneamente disattivato." },
        { status: 503 },
      );
    }

    const stripe = getStripeServer();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe non disponibile." }, { status: 503 });
    }

    if (body.productSlug && body.productSlug !== STRIPE_PRODUCT.slug) {
      return NextResponse.json({ error: "Prodotto non valido." }, { status: 400 });
    }

    const origin = getRequestOrigin(request);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: STRIPE_PRODUCT.currency,
            unit_amount: STRIPE_PRODUCT.amount,
            product_data: {
              name: STRIPE_PRODUCT.name,
              description: STRIPE_PRODUCT.description,
            },
          },
        },
      ],
      metadata: {
        productSlug: STRIPE_PRODUCT.slug,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Impossibile generare il link di checkout." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      { error: "Si e verificato un errore durante la creazione del checkout." },
      { status: 500 },
    );
  }
}
