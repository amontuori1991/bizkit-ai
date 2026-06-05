import { NextResponse } from "next/server";
import { isSaasAnalyticsEventName } from "@/lib/analytics-events";
import { isSupabaseConfigured } from "@/lib/env";
import { trackServerEvent } from "@/lib/server-analytics";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      eventName?: string;
      source?: "client";
    } | null;

    if (!body?.eventName || !isSaasAnalyticsEventName(body.eventName)) {
      return NextResponse.json({ error: "Evento analytics non valido." }, { status: 400 });
    }

    let userId: string | null = null;

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      }
    }

    await trackServerEvent({
      eventName: body.eventName,
      userId,
      source: "client",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics event route error:", error);
    return NextResponse.json({ error: "Errore durante il log analytics." }, { status: 500 });
  }
}
