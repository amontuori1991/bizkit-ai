import { NextResponse } from "next/server";
import {
  deleteManagedUserData,
  requireAdminRequest,
  type ManagedUserDataAction,
} from "@/lib/admin-users";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

const allowedActions = new Set<ManagedUserDataAction>([
  "test-data",
  "saved-contents",
  "calendars",
  "crm-clients",
  "business-profiles",
  "local-subscription",
]);

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdminRequest();
    const body = (await request.json().catch(() => ({}))) as {
      action?: ManagedUserDataAction;
    };
    const { userId } = await context.params;

    if (!body.action || !allowedActions.has(body.action)) {
      return NextResponse.json({ error: "Azione non valida." }, { status: 400 });
    }

    await deleteManagedUserData(userId, body.action);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NON_AUTHORIZED") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    console.error("Admin delete user data error:", error);
    return NextResponse.json(
      { error: "Errore durante la cancellazione dei dati utente." },
      { status: 500 },
    );
  }
}
