import { NextResponse } from "next/server";
import {
  pickPrimaryBusinessProfile,
  type BusinessProfile,
} from "@/lib/business-profile";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          hasProfile: false,
          activeBusinessType: null,
          hasCompleteProfile: false,
        },
        { status: 200 },
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        {
          hasProfile: false,
          activeBusinessType: null,
          hasCompleteProfile: false,
        },
        { status: 200 },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Utente non autenticato." }, { status: 401 });
    }

    const { data: profiles } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    const primaryProfile = pickPrimaryBusinessProfile((profiles as BusinessProfile[] | null) ?? []);

    return NextResponse.json({
      hasProfile: Boolean(primaryProfile),
      activeBusinessType: primaryProfile?.business_type ?? null,
      hasCompleteProfile: Boolean(
        primaryProfile?.business_name?.trim() &&
          primaryProfile?.business_type?.trim() &&
          primaryProfile?.city?.trim() &&
          primaryProfile?.tone_of_voice?.trim() &&
          primaryProfile?.target_audience?.trim(),
      ),
    });
  } catch (error) {
    console.error("Sidebar context error:", error);
    return NextResponse.json(
      {
        hasProfile: false,
        activeBusinessType: null,
        hasCompleteProfile: false,
      },
      { status: 200 },
    );
  }
}
