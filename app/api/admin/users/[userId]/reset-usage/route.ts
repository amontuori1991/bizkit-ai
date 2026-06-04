import { NextResponse } from "next/server";
import { requireAdminRequest, resetManagedUserUsageToday } from "@/lib/admin-users";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    await requireAdminRequest();
    const { userId } = await context.params;
    await resetManagedUserUsageToday(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NON_AUTHORIZED") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    console.error("Admin reset usage error:", error);
    return NextResponse.json(
      { error: "Errore durante il reset usage AI." },
      { status: 500 },
    );
  }
}
