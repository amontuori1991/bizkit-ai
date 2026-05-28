export type OutputVariantId = "short" | "medium" | "long";

export type OutputVariant = {
  id: OutputVariantId;
  label: string;
  description: string;
  content: string;
};

const variantConfig: Record<OutputVariantId, Omit<OutputVariant, "content">> = {
  short: {
    id: "short",
    label: "Short",
    description: "Versione rapida, ideale per pubblicare subito o usare come base.",
  },
  medium: {
    id: "medium",
    label: "Medium",
    description: "Equilibrio tra velocita, contesto e CTA commerciale.",
  },
  long: {
    id: "long",
    label: "Long",
    description: "Versione completa con piu storytelling e dettagli utili.",
  },
};

export function parseOutputVariants(rawText: string) {
  const variants = (Object.keys(variantConfig) as OutputVariantId[])
    .map((variantId) => {
      const pattern = new RegExp(
        `\\[${variantId.toUpperCase()}\\]([\\s\\S]*?)\\[\\/${variantId.toUpperCase()}\\]`,
        "i",
      );
      const match = rawText.match(pattern);
      const content = match?.[1]?.trim();

      if (!content) {
        return null;
      }

      return {
        ...variantConfig[variantId],
        content,
      } satisfies OutputVariant;
    })
    .filter((item): item is OutputVariant => Boolean(item));

  if (variants.length > 0) {
    return variants;
  }

  return [
    {
      ...variantConfig.medium,
      content: rawText.trim(),
    },
  ] satisfies OutputVariant[];
}

