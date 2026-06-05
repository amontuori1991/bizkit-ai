import { redirect } from "next/navigation";
import { ensureWelcomeEmailForUser } from "@/lib/email";
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

  try {
    if (user.email) {
      await ensureWelcomeEmailForUser({
        userId: user.id,
        email: user.email,
        fullName:
          typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
      });
    }
  } catch (error) {
    console.error("Welcome email error:", error);
  }

  return { supabase, user };
}
