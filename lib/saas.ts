import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireDashboardUser() {
  if (!isSupabaseConfigured()) {
    redirect("/login?disabled=supabase");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?disabled=supabase");
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}
