export const FEEDBACK_CATEGORIES = [
  "bug",
  "feature_request",
  "improvement",
  "usability",
  "other",
] as const;

export const FEEDBACK_PRIORITIES = ["low", "medium", "high"] as const;

export const FEEDBACK_STATUSES = [
  "open",
  "under_review",
  "planned",
  "completed",
  "rejected",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export type FeedbackPriority = (typeof FEEDBACK_PRIORITIES)[number];
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export type FeedbackItem = {
  id: string;
  user_id: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  title: string;
  description: string;
  page_url: string | null;
  browser_info: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminFeedbackItem = FeedbackItem & {
  userEmail: string | null;
  planId: string;
};

export function isFeedbackCategory(value: string | null | undefined): value is FeedbackCategory {
  return FEEDBACK_CATEGORIES.includes((value ?? "") as FeedbackCategory);
}

export function isFeedbackPriority(value: string | null | undefined): value is FeedbackPriority {
  return FEEDBACK_PRIORITIES.includes((value ?? "") as FeedbackPriority);
}

export function isFeedbackStatus(value: string | null | undefined): value is FeedbackStatus {
  return FEEDBACK_STATUSES.includes((value ?? "") as FeedbackStatus);
}

export function formatFeedbackCategory(value: FeedbackCategory | string | null | undefined) {
  switch (value) {
    case "bug":
      return "Bug";
    case "feature_request":
      return "Feature request";
    case "improvement":
      return "Miglioramento";
    case "usability":
      return "Usabilita";
    case "other":
      return "Altro";
    default:
      return "Feedback";
  }
}

export function formatFeedbackPriority(value: FeedbackPriority | string | null | undefined) {
  switch (value) {
    case "low":
      return "Bassa";
    case "medium":
      return "Media";
    case "high":
      return "Alta";
    default:
      return "Media";
  }
}

export function formatFeedbackStatus(value: FeedbackStatus | string | null | undefined) {
  switch (value) {
    case "open":
      return "Open";
    case "under_review":
      return "In review";
    case "planned":
      return "Pianificato";
    case "completed":
      return "Completato";
    case "rejected":
      return "Rifiutato";
    default:
      return "Open";
  }
}

export function getFeedbackCategoryBadgeClass(category: FeedbackCategory | string | null | undefined) {
  switch (category) {
    case "bug":
      return "border-red-200 bg-red-50 text-red-700";
    case "feature_request":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "improvement":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "usability":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export function getFeedbackPriorityBadgeClass(priority: FeedbackPriority | string | null | undefined) {
  switch (priority) {
    case "high":
      return "border-red-200 bg-red-50 text-red-700";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

export function getFeedbackStatusBadgeClass(status: FeedbackStatus | string | null | undefined) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "planned":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "under_review":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "rejected":
      return "border-slate-300 bg-slate-100 text-slate-700";
    default:
      return "border-pink-200 bg-pink-50 text-pink-700";
  }
}

export function buildFeedbackTitle(title: string) {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : "Nuovo feedback";
}

