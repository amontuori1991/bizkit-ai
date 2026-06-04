import { NextResponse } from "next/server";
import { deleteManagedUserCompletely, requireAdminRequest } from "@/lib/admin-users";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdminRequest();
    const body = (await request.json().catch(() => ({}))) as {
      confirmText?: string;
    };
    const { userId } = await context.params;

    if (body.confirmText !== "DELETE") {
      return NextResponse.json(
        { error: "Per eliminare completamente l'utente devi digitare DELETE." },
        { status: 400 },
      );
    }

    await deleteManagedUserCompletely(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NON_AUTHORIZED") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    console.error("Admin complete delete user error:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione completa dell'utente." },
      { status: 500 },
    );
  }
}
