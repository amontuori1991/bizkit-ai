import { env } from "@/lib/env";
import {
  isSaasAnalyticsEventName,
  type SaasAnalyticsEventName,
} from "@/lib/analytics-events";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

type ServerAnalyticsSource = "client" | "server" | "webhook";

function readServerAnalyticsSecret() {
  return (
    process.env.GA_API_SECRET?.trim() ||
    process.env.GA4_API_SECRET?.trim() ||
    process.env.GA_MEASUREMENT_PROTOCOL_SECRET?.trim() ||
    ""
  );
}

async function logAnalyticsEvent(input: {
  userId?: string | null;
  eventName: SaasAnalyticsEventName;
  source: ServerAnalyticsSource;
}) {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("analytics_event_logs").insert({
    user_id: input.userId ?? null,
    event_name: input.eventName,
    source: input.source,
  });

  if (error) {
    console.error("Analytics event log error:", error);
  }
}

export async function trackServerEvent(input: {
  eventName: string;
  userId?: string | null;
  source?: ServerAnalyticsSource;
}) {
  if (!isSaasAnalyticsEventName(input.eventName)) {
    return { success: false, ignored: true } as const;
  }

  await logAnalyticsEvent({
    userId: input.userId,
    eventName: input.eventName,
    source: input.source ?? "server",
  });

  const measurementId = env.gaId;
  const apiSecret = readServerAnalyticsSecret();

  if (!measurementId || !apiSecret) {
    console.warn(
      `[analytics] Evento server "${input.eventName}" registrato localmente ma non inviato a GA4: manca NEXT_PUBLIC_GA_ID o GA_API_SECRET.`,
    );
    return { success: false, disabled: true } as const;
  }

  try {
    const clientId = input.userId ? `server-${input.userId}` : "server-anonymous";
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          user_id: input.userId ?? undefined,
          events: [
            {
              name: input.eventName,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "GA4 Measurement Protocol request fallita.");
    }

    return { success: true } as const;
  } catch (error) {
    console.error(`GA4 server event error for ${input.eventName}:`, error);
    return { success: false, error } as const;
  }
}
