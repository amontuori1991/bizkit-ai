"use client";

import { useEffect } from "react";
import { trackViewProduct } from "@/lib/analytics";

type ProductViewTrackerProps = {
  itemId: string;
  itemName: string;
  category: string;
  price: number;
};

export function ProductViewTracker({
  itemId,
  itemName,
  category,
  price,
}: ProductViewTrackerProps) {
  useEffect(() => {
    trackViewProduct({
      itemId,
      itemName,
      category,
      price,
    });
  }, [category, itemId, itemName, price]);

  return null;
}
