import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase non configurato. Il salvataggio contenuti e disattivato." },
        { status: 503 },
      );
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
      type?: string;
      title?: string;
      content?: string;
      generationId?: string | null;
    };

    if (!body.type || !body.content?.trim() || !body.title?.trim()) {
      return NextResponse.json({ error: "Dati contenuto incompleti." }, { status: 400 });
    }

    const { error } = await supabase.from("saved_contents").insert({
      user_id: user.id,
      generation_id: body.generationId ?? null,
      type: body.type,
      title: body.title.trim(),
      content: body.content.trim(),
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save content error:", error);
    return NextResponse.json({ error: "Errore durante il salvataggio." }, { status: 500 });
  }
}
