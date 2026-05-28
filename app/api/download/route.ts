import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isStripeCheckoutConfigured } from "@/lib/env";
import { getStripeServer, STRIPE_PRODUCT } from "@/lib/stripe";

function isAllowedOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (secFetchSite && !["same-origin", "same-site", "none"].includes(secFetchSite)) {
    return false;
  }

  if (origin) {
    try {
      if (new URL(origin).origin !== requestUrl.origin) {
        return false;
      }
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      if (new URL(referer).origin !== requestUrl.origin) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Sessione mancante." }, { status: 400 });
  }

  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Richiesta non autorizzata." }, { status: 403 });
  }

  try {
    if (!isStripeCheckoutConfigured()) {
      return NextResponse.json(
        { error: "Stripe non configurato. Il download protetto richiede la verifica del pagamento." },
        { status: 503 },
      );
    }

    const stripe = getStripeServer();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe non disponibile." }, { status: 503 });
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json({ error: "Pagamento non valido o non completato." }, { status: 403 });
    }

    if (session.metadata?.productSlug !== STRIPE_PRODUCT.slug) {
      return NextResponse.json({ error: "Sessione non associata al prodotto corretto." }, { status: 403 });
    }

    const filePath = path.join(process.cwd(), "public", "downloads", "ai-kit-per-palestre.zip");
    let fileBuffer: Buffer;

    try {
      fileBuffer = await readFile(filePath);
    } catch {
      return NextResponse.json({ error: "File del kit non trovato." }, { status: 404 });
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="ai-kit-per-palestre.zip"',
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Protected download error:", error);

    return NextResponse.json(
      { error: "Si e verificato un errore durante la verifica del download." },
      { status: 500 },
    );
  }
}
