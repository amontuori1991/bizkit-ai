import { NextResponse } from "next/server";
import { createConversationTitleFromPrompt } from "@/lib/assistant-coach";
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
      .from("assistant_conversations")
      .select("id,title,created_at,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ conversations: data ?? [] });
  } catch (error) {
    console.error("Assistant conversations list error:", error);
    return NextResponse.json({ error: "Impossibile caricare le conversazioni." }, { status: 500 });
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
      prompt?: string;
    };

    const title =
      body.title?.trim() || (body.prompt?.trim() ? createConversationTitleFromPrompt(body.prompt) : "Nuova conversazione");

    const { data, error } = await supabase
      .from("assistant_conversations")
      .insert({
        user_id: user.id,
        title,
      })
      .select("id,title,created_at,updated_at")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ conversation: data });
  } catch (error) {
    console.error("Assistant conversation create error:", error);
    return NextResponse.json({ error: "Impossibile creare la conversazione." }, { status: 500 });
  }
}
