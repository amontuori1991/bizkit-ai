import { NextResponse } from "next/server";
import {
  sendKitPurchaseEmail,
  sendSubscriptionEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import { requireAdminRequest } from "@/lib/admin-users";
import { readSiteSettings } from "@/lib/site-settings";

type TestKind = "welcome" | "subscription" | "kit";

function isTestKind(value: unknown): value is TestKind {
  return value === "welcome" || value === "subscription" || value === "kit";
}

export async function POST(request: Request) {
  try {
    await requireAdminRequest();

    const body = (await request.json().catch(() => null)) as { kind?: unknown } | null;
    if (!isTestKind(body?.kind)) {
      return NextResponse.json({ error: "Template email non valido." }, { status: 400 });
    }

    const siteSettings = await readSiteSettings();
    const adminEmail = siteSettings.supportEmail;

    if (body.kind === "welcome") {
      await sendWelcomeEmail({
        email: adminEmail,
        fullName: "Admin BizKit AI",
        logType: "welcome_test",
      });
    }

    if (body.kind === "subscription") {
      await sendSubscriptionEmail({
        email: adminEmail,
        planId: "pro",
        logType: "subscription_test",
      });
    }

    if (body.kind === "kit") {
      await sendKitPurchaseEmail({
        email: adminEmail,
        productSlug: "ai-kit-per-centri-sportivi-outdoor",
        logType: "kit_test",
      });
    }

    return NextResponse.json({
      message: `Email test ${body.kind} inviata a ${adminEmail}.`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NON_AUTHORIZED") {
      return NextResponse.json({ error: "Sessione admin non valida." }, { status: 401 });
    }

    console.error("Admin email test error:", error);
    return NextResponse.json(
      { error: "Errore durante l'invio della test email." },
      { status: 500 },
    );
  }
}
