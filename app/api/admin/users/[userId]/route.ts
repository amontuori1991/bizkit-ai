import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const { userId } = await context.params;

  if (!userId?.trim()) {
    return NextResponse.json({ error: "userId mancante." }, { status: 400 });
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY non configurata." },
      { status: 503 },
    );
  }

  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Admin delete user error:", error);
      return NextResponse.json(
        { error: "Impossibile eliminare l'utente da Supabase Auth." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete user route error:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione dell'utente." },
      { status: 500 },
    );
  }
}
