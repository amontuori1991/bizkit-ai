import { NextResponse } from "next/server";
import { listAdminFeedbackItems } from "@/lib/admin-feedback";
import { requireAdminRequest } from "@/lib/admin-users";

export async function GET() {
  try {
    await requireAdminRequest();
    const data = await listAdminFeedbackItems();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "NON_AUTHORIZED") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    console.error("Admin feedback list route error:", error);
    return NextResponse.json(
      { error: "Errore durante il caricamento dei feedback." },
      { status: 500 },
    );
  }
}

