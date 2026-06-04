import { NextResponse } from "next/server";
import { listManagedAdminUsers, requireAdminRequest } from "@/lib/admin-users";

export async function GET() {
  try {
    await requireAdminRequest();
    const data = await listManagedAdminUsers();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "NON_AUTHORIZED") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    console.error("Admin users list error:", error);
    return NextResponse.json(
      { error: "Errore durante il caricamento utenti." },
      { status: 500 },
    );
  }
}
