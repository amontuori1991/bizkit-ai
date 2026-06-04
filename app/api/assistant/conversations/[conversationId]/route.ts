import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

    const { conversationId } = await context.params;

    const [{ data: conversation, error: conversationError }, { data: messages, error: messagesError }] =
      await Promise.all([
        supabase
          .from("assistant_conversations")
          .select("id,title,created_at,updated_at")
          .eq("id", conversationId)
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("assistant_messages")
          .select("id,conversation_id,user_id,role,content,input_tokens,output_tokens,total_tokens,created_at")
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
      ]);

    if (conversationError) {
      throw conversationError;
    }

    if (messagesError) {
      throw messagesError;
    }

    if (!conversation) {
      return NextResponse.json({ error: "Conversazione non trovata." }, { status: 404 });
    }

    return NextResponse.json({
      conversation,
      messages: messages ?? [],
    });
  } catch (error) {
    console.error("Assistant conversation load error:", error);
    return NextResponse.json({ error: "Impossibile caricare la conversazione." }, { status: 500 });
  }
}
