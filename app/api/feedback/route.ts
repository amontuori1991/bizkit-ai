import { NextResponse } from "next/server";
import { buildFeedbackTitle, isFeedbackCategory, isFeedbackPriority, type FeedbackItem } from "@/lib/feedback";
import { isSupabaseConfigured } from "@/lib/env";
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

    const { data, error } = await supabase
      .from("feedback_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ feedback: (data as FeedbackItem[] | null) ?? [] });
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
    const { data, error } = await supabase
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
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ feedback: data as FeedbackItem });
  } catch (error) {
    console.error("Feedback create error:", error);
    return NextResponse.json({ error: "Impossibile inviare il feedback." }, { status: 500 });
  }
}

