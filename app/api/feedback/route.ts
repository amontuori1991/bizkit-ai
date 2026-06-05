import { NextResponse } from "next/server";
import {
  buildFeedbackTicketCode,
  buildFeedbackTitle,
  isFeedbackCategory,
  isFeedbackPriority,
  type FeedbackItem,
  type FeedbackStatusEvent,
} from "@/lib/feedback";
import { isSupabaseConfigured } from "@/lib/env";
import { notifyAdminAboutNewFeedback } from "@/lib/feedback-notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase non configurato." }, { status: 503 });
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase non disponibile." }, { status: 503 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Utente non autenticato." }, { status: 401 });
    }

    const [{ data: feedbackData, error: feedbackError }, { data: eventsData, error: eventsError }] =
      await Promise.all([
        supabase
          .from("feedback_items")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("feedback_status_events")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

    if (feedbackError) {
      throw feedbackError;
    }

    if (eventsError) {
      throw eventsError;
    }

    return NextResponse.json({
      feedback: (feedbackData as FeedbackItem[] | null) ?? [],
      statusEvents: (eventsData as FeedbackStatusEvent[] | null) ?? [],
    });
  } catch (error) {
    console.error("Feedback list error:", error);
    return NextResponse.json({ error: "Impossibile caricare i feedback." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase non configurato." }, { status: 503 });
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase non disponibile." }, { status: 503 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Utente non autenticato." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      description?: string;
      category?: string;
      priority?: string;
      pageUrl?: string | null;
      browserInfo?: string | null;
    };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Titolo obbligatorio." }, { status: 400 });
    }

    if (!body.description?.trim()) {
      return NextResponse.json({ error: "Descrizione obbligatoria." }, { status: 400 });
    }

    if (!isFeedbackCategory(body.category)) {
      return NextResponse.json({ error: "Categoria non valida." }, { status: 400 });
    }

    if (!isFeedbackPriority(body.priority)) {
      return NextResponse.json({ error: "Priorita non valida." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { data: insertedFeedback, error } = await supabase
      .from("feedback_items")
      .insert({
        user_id: user.id,
        category: body.category,
        priority: body.priority,
        status: "open",
        title: buildFeedbackTitle(body.title),
        description: body.description.trim(),
        page_url: body.pageUrl?.trim() || null,
        browser_info: body.browserInfo?.trim() || null,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const feedback = insertedFeedback as FeedbackItem;
    const ticketCode = buildFeedbackTicketCode(feedback.id);

    const [{ data: updatedFeedback, error: updateError }, { error: eventError }] = await Promise.all([
      supabase
        .from("feedback_items")
        .update({
          ticket_code: ticketCode,
          updated_at: now,
        })
        .eq("id", feedback.id)
        .select("*")
        .single(),
      supabase.from("feedback_status_events").insert({
        feedback_id: feedback.id,
        user_id: user.id,
        from_status: null,
        to_status: "open",
        actor_type: "system",
        note_snapshot: null,
        created_at: now,
      }),
    ]);

    if (updateError) {
      throw updateError;
    }

    if (eventError) {
      throw eventError;
    }

    const completeFeedback = updatedFeedback as FeedbackItem;

    try {
      await notifyAdminAboutNewFeedback({
        feedback: completeFeedback,
        userEmail: user.email ?? null,
      });
    } catch (notificationError) {
      console.error("Feedback admin notification error:", notificationError);
    }

    return NextResponse.json({ feedback: completeFeedback });
  } catch (error) {
    console.error("Feedback create error:", error);
    return NextResponse.json({ error: "Impossibile inviare il feedback." }, { status: 500 });
  }
}
