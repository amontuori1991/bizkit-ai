import type { AIContentType, QuickTemplate } from "@/lib/business-verticals";
import {
  getKnowledgePackBySlug,
  getKnowledgePackRegistry,
  getKnowledgePacksByVertical,
  resolveKnowledgePack,
} from "@/lib/knowledge-packs/registry";
import type { KnowledgePack, KnowledgePackProfileInput, KnowledgePackVertical } from "@/lib/knowledge-packs/types";
import { getQuickTemplatesForType } from "@/lib/business-verticals";

export type {
  KnowledgePack,
  KnowledgePackProfileInput,
  KnowledgePackTemplate,
  KnowledgePackVertical,
  SupportedCalendarFormat,
} from "@/lib/knowledge-packs/types";

export {
  getKnowledgePackRegistry,
  getKnowledgePacksByVertical,
  getKnowledgePackBySlug,
  resolveKnowledgePack,
};

export function getKnowledgePackLabel(profile?: KnowledgePackProfileInput | null) {
  return resolveKnowledgePack(profile).label;
}

export function getQuickTemplatesForProfile(
  type: AIContentType,
  profile?: KnowledgePackProfileInput | null,
  fallbackTemplates?: QuickTemplate[],
) {
  const pack = resolveKnowledgePack(profile);
  return pack.quickTemplates[type] ?? fallbackTemplates ?? getQuickTemplatesForType(type);
}

export function getAssistantHintsForProfile(profile?: KnowledgePackProfileInput | null) {
  return resolveKnowledgePack(profile).assistantHints;
}

export function getCalendarIdeasForProfile(profile?: KnowledgePackProfileInput | null) {
  return resolveKnowledgePack(profile).calendarIdeas;
}

export function getKnowledgePackByVertical(vertical: KnowledgePackVertical, slug?: string | null) {
  const pack = slug ? getKnowledgePackBySlug(slug) : null;
  if (pack && pack.vertical === vertical) {
    return pack;
  }

  return getKnowledgePacksByVertical(vertical)[0] ?? null;
}
