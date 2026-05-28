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

    const trimmedTitle = body.title.trim();
    const trimmedContent = body.content.trim();

    const duplicateQuery = body.generationId
      ? supabase
          .from("saved_contents")
          .select("id")
          .eq("user_id", user.id)
          .eq("generation_id", body.generationId)
          .limit(1)
          .maybeSingle()
      : supabase
          .from("saved_contents")
          .select("id")
          .eq("user_id", user.id)
          .eq("type", body.type)
          .eq("title", trimmedTitle)
          .eq("content", trimmedContent)
          .limit(1)
          .maybeSingle();

    const { data: existingSavedContent, error: duplicateError } = await duplicateQuery;
    if (duplicateError) {
      throw duplicateError;
    }

    if (!existingSavedContent) {
      const { error: insertError } = await supabase.from("saved_contents").insert({
        user_id: user.id,
        generation_id: body.generationId ?? null,
        type: body.type,
        title: trimmedTitle,
        content: trimmedContent,
      });

      if (insertError) {
        throw insertError;
      }
    }

    if (body.generationId) {
      const { error: updateError } = await supabase
        .from("generated_contents")
        .update({ is_saved: true })
        .eq("id", body.generationId)
        .eq("user_id", user.id);

      if (updateError) {
        throw updateError;
      }
    }

    return NextResponse.json({
      success: true,
      alreadySaved: Boolean(existingSavedContent),
      generationUpdated: Boolean(body.generationId),
    });
  } catch (error) {
    console.error("Save content error:", error);
    return NextResponse.json({ error: "Errore durante il salvataggio." }, { status: 500 });
  }
}
