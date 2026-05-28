"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { trackStartCheckout } from "@/lib/analytics";

type StripeCheckoutButtonProps = {
  productSlug: string;
  productName: string;
  category: string;
  price: number;
  disabled?: boolean;
  disabledMessage?: string;
};

const stripePromise = (() => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);
})();

export function StripeCheckoutButton({
  productSlug,
  productName,
  category,
  price,
  disabled = false,
  disabledMessage,
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCheckout() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (disabled) {
        throw new Error(
          disabledMessage || "Stripe non e configurato. Il checkout reale e disattivato.",
        );
      }

      trackStartCheckout({
        itemId: productSlug,
        itemName: productName,
        category,
        price,
      });

      const stripeClient = await stripePromise;

      if (!stripeClient) {
        throw new Error(
          "Stripe non e configurato. Aggiungi NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY alle variabili ambiente.",
        );
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productSlug }),
      });

      const data = (await response.json()) as { error?: string; url?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout non disponibile in questo momento.");
      }

      window.location.href = data.url;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Si e verificato un errore inatteso durante il checkout.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isLoading}
        aria-disabled={disabled || isLoading}
        className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {disabled ? "Checkout non disponibile" : isLoading ? "Reindirizzamento a Stripe..." : "Acquista ora"}
      </button>
      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
