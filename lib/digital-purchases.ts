import type Stripe from "stripe";
import { products } from "@/data/products";
import { getDownloadsByProductSlug } from "@/data/downloads";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

function getProductBySlug(slug?: string | null) {
  return products.find((product) => product.slug === slug) ?? null;
}

async function findUserIdForPurchase(args: {
  explicitUserId?: string | null;
  customerEmail?: string | null;
}) {
  if (args.explicitUserId) {
    return args.explicitUserId;
  }

  if (!args.customerEmail) {
    return null;
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", args.customerEmail)
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

export async function syncDigitalPurchaseFromCheckoutSession(args: {
  session: Stripe.Checkout.Session;
  explicitUserId?: string | null;
}) {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return null;
  }

  const productSlug = args.session.metadata?.productSlug ?? null;
  const product = getProductBySlug(productSlug);
  const bundle = getDownloadsByProductSlug(productSlug);

  if (!productSlug || !product || !bundle) {
    return null;
  }

  const userId = await findUserIdForPurchase({
    explicitUserId: args.explicitUserId,
    customerEmail: args.session.customer_details?.email ?? args.session.customer_email ?? null,
  });

  if (!userId) {
    return null;
  }

  const orderPayload = {
    user_id: userId,
    product_id: null,
    stripe_checkout_session_id: args.session.id,
    stripe_payment_intent_id:
      typeof args.session.payment_intent === "string" ? args.session.payment_intent : null,
    amount_cents: args.session.amount_total ?? 0,
    currency: args.session.currency ?? "eur",
    status: args.session.payment_status === "paid" ? "paid" : "pending",
  };

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_checkout_session_id", args.session.id)
    .maybeSingle();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .upsert(orderPayload, { onConflict: "stripe_checkout_session_id" })
    .select("id")
    .single();

  if (orderError || !order) {
    throw orderError ?? new Error("Impossibile sincronizzare l'ordine digitale.");
  }

  const { data: existingDownload } = await supabase
    .from("downloads")
    .select("id")
    .eq("user_id", userId)
    .eq("order_id", order.id)
    .eq("product_slug", productSlug)
    .limit(1)
    .maybeSingle();

  if (!existingDownload) {
    const { error: downloadError } = await supabase.from("downloads").insert({
      user_id: userId,
      order_id: order.id,
      product_slug: productSlug,
      file_name: bundle.zipFileName,
      download_count: 0,
    });

    if (downloadError) {
      throw downloadError;
    }
  }

  return {
    userId,
    productSlug,
    orderId: order.id,
    fileName: bundle.zipFileName,
    customerEmail: args.session.customer_details?.email ?? args.session.customer_email ?? null,
    isNewOrder: !existingOrder,
    createdDownload: !existingDownload,
  };
}

export async function getOwnedDigitalProductSlugs(userId: string) {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("downloads")
    .select("product_slug")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return Array.from(
    new Set((data ?? []).map((item) => item.product_slug).filter((value): value is string => Boolean(value))),
  );
}

export async function getOwnedDigitalDownloads(userId: string) {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("downloads")
    .select("id, product_slug, file_name, download_count, last_downloaded_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const seen = new Set<string>();

  return (data ?? []).filter((item) => {
    if (seen.has(item.product_slug)) {
      return false;
    }

    seen.add(item.product_slug);
    return true;
  });
}
