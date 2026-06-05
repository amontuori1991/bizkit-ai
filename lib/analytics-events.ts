export const SAAS_ANALYTICS_EVENTS = [
  "signup_completed",
  "login_completed",
  "business_profile_created",
  "business_profile_updated",
  "content_generated",
  "content_saved",
  "calendar_generated",
  "crm_client_created",
  "feedback_submitted",
  "assistant_conversation_started",
  "assistant_message_sent",
  "subscription_started",
  "subscription_upgraded",
  "subscription_cancelled",
  "kit_purchased",
  "download_started",
] as const;

export type SaasAnalyticsEventName = (typeof SAAS_ANALYTICS_EVENTS)[number];

export function isSaasAnalyticsEventName(value: string): value is SaasAnalyticsEventName {
  return SAAS_ANALYTICS_EVENTS.includes(value as SaasAnalyticsEventName);
}
