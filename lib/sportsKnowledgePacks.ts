import type {
  AIContentType,
  QuickTemplate,
  SportsCenterSubcategory,
} from "@/lib/business-verticals";
import {
  getKnowledgePackBySlug,
  getQuickTemplatesForProfile,
  resolveKnowledgePack,
  type KnowledgePack,
  type KnowledgePackTemplate,
} from "@/lib/knowledge-packs";

export type SportsKnowledgePackTemplate = KnowledgePackTemplate;
export type SportsKnowledgePack = KnowledgePack;

export function getSportsKnowledgePack(
  subcategory?: string | null,
): SportsKnowledgePack {
  return (
    getKnowledgePackBySlug(subcategory) ??
    resolveKnowledgePack({
      business_type: "sports_center",
      sports_subcategory: subcategory,
    })
  );
}

export function getSportsKnowledgePackLabel(subcategory?: string | null) {
  return getSportsKnowledgePack(subcategory).label;
}

export function getSportsQuickTemplatesForSubcategory(
  type: AIContentType,
  subcategory?: SportsCenterSubcategory | string | null,
  fallbackTemplates: QuickTemplate[] = [],
) {
  return getQuickTemplatesForProfile(
    type,
    {
      business_type: "sports_center",
      sports_subcategory: subcategory,
    },
    fallbackTemplates,
  );
}
