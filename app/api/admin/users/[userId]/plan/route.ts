import { NextResponse } from "next/server";
import { requireAdminRequest, updateManagedUserPlan } from "@/lib/admin-users";
import type { RuntimePlanId } from "@/lib/plan-limits";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

const allowedPlans = new Set<RuntimePlanId>(["free", "starter", "pro", "agency"]);

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminRequest();
    const body = (await request.json().catch(() => ({}))) as {
      planId?: RuntimePlanId;
    };
    const { userId } = await context.params;

    if (!body.planId || !allowedPlans.has(body.planId)) {
      return NextResponse.json({ error: "Piano non valido." }, { status: 400 });
    }

    await updateManagedUserPlan(userId, body.planId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NON_AUTHORIZED") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    console.error("Admin update plan error:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del piano." },
      { status: 500 },
    );
  }
}
