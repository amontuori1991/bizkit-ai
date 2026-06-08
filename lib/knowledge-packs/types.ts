import type { AIContentType, QuickTemplate } from "@/lib/business-verticals";

export type KnowledgePackVertical = "fitness" | "beauty" | "sports";

export type KnowledgePackProfileInput = {
  business_type?: string | null;
  business_name?: string | null;
  services?: string | null;
  target_audience?: string | null;
  unique_selling_points?: string | null;
  sports_subcategory?: string | null;
  salon_specialties?: string | null;
  salon_style?: string | null;
};

export type KnowledgePackTemplate = {
  title: string;
  prompt: string;
  body?: string;
};

export type SupportedCalendarFormat =
  | "Post Instagram"
  | "Reel"
  | "Story"
  | "TikTok"
  | "WhatsApp follow-up";

export type KnowledgePack = {
  id: string;
  slug: string;
  label: string;
  vertical: KnowledgePackVertical;
  businessTypes: string[];
  aliases?: string[];
  keywords?: string[];
  positioning: string;
  contentPillars: string[];
  reelIdeas: string[];
  promoIdeas: string[];
  crmTemplates: KnowledgePackTemplate[];
  calendarIdeas: string[];
  seasonalCampaigns: string[];
  assistantHints: string[];
  crmSuggestions: string[];
  clientMessages: string[];
  offerTypes: string[];
  supportedCalendarFormats: SupportedCalendarFormat[];
  quickTemplates: Partial<Record<AIContentType, QuickTemplate[]>>;
};
