import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { checkPlanResourceLimit, getPlanUsageSummary, normalizePlanId } from "@/lib/plan-limits";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BusinessProfileBody = {
  profile_id?: string;
  is_primary?: boolean;
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
  sports_subcategory?: string;
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
    const profileId = typeof body.profile_id === "string" ? body.profile_id : null;
    const requestedPrimary = body.is_primary ?? false;

    const [{ data: accountProfile }, existingProfileResult] = await Promise.all([
      supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle(),
      profileId
        ? supabase
            .from("business_profiles")
            .select("*")
            .eq("id", profileId)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);
    const existingProfile = existingProfileResult.data;

    if (profileId && !existingProfile) {
      return NextResponse.json({ error: "Business profile non trovato." }, { status: 404 });
    }

    const planId = normalizePlanId(accountProfile?.subscription_tier);
    if (!existingProfile) {
      const planAccess = await checkPlanResourceLimit(supabase, {
        userId: user.id,
        planId,
        resource: "businessProfiles",
      });

      if (!planAccess.allowed) {
        return NextResponse.json(
          {
            error: planAccess.message,
            upgradePlan: planAccess.upgradePlan,
            upgradeUrl: planAccess.upgradeUrl,
          },
          { status: 403 },
        );
      }
    }

    const isPrimary = existingProfile
      ? existingProfile.is_primary
        ? true
        : requestedPrimary
      : requestedPrimary || true;

    const payload = {
      user_id: user.id,
      is_primary: isPrimary,
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
      sports_subcategory: normalizeValue(body.sports_subcategory),
      salon_specialties: normalizeValue(body.salon_specialties),
      booking_link: normalizeValue(body.booking_link),
      opening_hours: normalizeValue(body.opening_hours),
      stylist_names: normalizeValue(body.stylist_names),
      products_used: normalizeValue(body.products_used),
      salon_style: normalizeValue(body.salon_style),
    };

    if (payload.is_primary) {
      const resetPrimaryQuery = profileId
        ? supabase
            .from("business_profiles")
            .update({ is_primary: false })
            .eq("user_id", user.id)
            .neq("id", profileId)
        : supabase.from("business_profiles").update({ is_primary: false }).eq("user_id", user.id);

      const { error: resetPrimaryError } = await resetPrimaryQuery;

      if (resetPrimaryError) {
        throw resetPrimaryError;
      }
    }

    const mutation = existingProfile
      ? supabase
          .from("business_profiles")
          .update(payload)
          .eq("id", profileId)
          .eq("user_id", user.id)
      : supabase.from("business_profiles").insert(payload);

    const { data, error } = await mutation.select("*").single();

    if (error) {
      throw error;
    }

    const usage = await getPlanUsageSummary(supabase, {
      userId: user.id,
      subscriptionTier: accountProfile?.subscription_tier,
    });

    return NextResponse.json({ success: true, profile: data, usage });
  } catch (error) {
    console.error("Save business profile error:", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio del profilo business." },
      { status: 500 },
    );
  }
}
