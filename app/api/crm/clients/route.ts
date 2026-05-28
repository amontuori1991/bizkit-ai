import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase non configurato. Il CRM e disattivato." },
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
      name?: string;
      email?: string;
      phone?: string;
      membership_plan?: string;
      status?: string;
      notes?: string;
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome cliente obbligatorio." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("clients")
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        membership_plan: body.membership_plan?.trim() || null,
        status: body.status?.trim() || "lead",
        notes: body.notes?.trim() || null,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ client: data });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json({ error: "Errore durante il salvataggio cliente." }, { status: 500 });
  }
}
