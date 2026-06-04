import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  const requestUrl = new URL(request.url);
  const redirectUrl = new URL("/?logged_out=1", requestUrl.origin);

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
