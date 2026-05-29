import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BusinessProfileBody = {
  business_name?: string;
  business_type?: string;
  city?: string;
  address?: string;
  website?: string;
  instagram?: string;
  tone_of_voice?: string;
  target_audience?: string;
  services?: string;
  unique_selling_points?: string;
  preferred_cta?: string;
  preferred_hashtags?: string;
  salon_specialties?: string;
  booking_link?: string;
  opening_hours?: string;
  stylist_names?: string;
  products_used?: string;
  salon_style?: string;
};

function normalizeValue(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase non configurato. Il profilo business non puo essere salvato." },
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

    const body = (await request.json().catch(() => ({}))) as BusinessProfileBody;

    const payload = {
      user_id: user.id,
      business_name: normalizeValue(body.business_name),
      business_type: normalizeValue(body.business_type),
      city: normalizeValue(body.city),
      address: normalizeValue(body.address),
      website: normalizeValue(body.website),
      instagram: normalizeValue(body.instagram),
      tone_of_voice: normalizeValue(body.tone_of_voice),
      target_audience: normalizeValue(body.target_audience),
      services: normalizeValue(body.services),
      unique_selling_points: normalizeValue(body.unique_selling_points),
      preferred_cta: normalizeValue(body.preferred_cta),
      preferred_hashtags: normalizeValue(body.preferred_hashtags),
      salon_specialties: normalizeValue(body.salon_specialties),
      booking_link: normalizeValue(body.booking_link),
      opening_hours: normalizeValue(body.opening_hours),
      stylist_names: normalizeValue(body.stylist_names),
      products_used: normalizeValue(body.products_used),
      salon_style: normalizeValue(body.salon_style),
    };

    const { data, error } = await supabase
      .from("business_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error("Save business profile error:", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio del profilo business." },
      { status: 500 },
    );
  }
}
