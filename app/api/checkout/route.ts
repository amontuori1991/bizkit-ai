import { NextResponse } from "next/server";
import { isStripeCheckoutConfigured } from "@/lib/env";
import { getStripeProductBySlug, getStripeServer } from "@/lib/stripe";
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

    const product = getStripeProductBySlug(body.productSlug);

    if (!product) {
      return NextResponse.json({ error: "Prodotto non valido." }, { status: 400 });
    }

    const origin = getRequestOrigin(request);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel?product=${product.slug}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency,
            unit_amount: product.amount,
            product_data: {
              name: product.name,
              description: product.description,
            },
          },
        },
      ],
      metadata: {
        productSlug: product.slug,
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
