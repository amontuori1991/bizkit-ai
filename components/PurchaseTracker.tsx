"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics";

type PurchaseTrackerProps = {
  sessionId: string;
  itemId: string;
  itemName: string;
  category: string;
  price: number;
};

export function PurchaseTracker({
  sessionId,
  itemId,
  itemName,
  category,
  price,
}: PurchaseTrackerProps) {
  useEffect(() => {
    const storageKey = `bizkit-ai-purchase-tracked:${sessionId}`;

    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    trackPurchase({
      transactionId: sessionId,
      itemId,
      itemName,
      category,
      price,
    });

    window.sessionStorage.setItem(storageKey, "true");
  }, [category, itemId, itemName, price, sessionId]);

  return null;
}
