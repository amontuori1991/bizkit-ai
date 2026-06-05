import { NextResponse } from "next/server";
import { parseCrmImportFile } from "@/lib/crm-import";
import { isSupabaseConfigured } from "@/lib/env";
import { checkPlanResourceLimit, normalizePlanId } from "@/lib/plan-limits";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase non configurato. Il CRM e disattivato." },
        { status: 503 },
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase non disponibile." }, { status: 503 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Utente non autenticato." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File import obbligatorio." }, { status: 400 });
    }

    const { data: accountProfile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .maybeSingle();

    const { rows, skippedRows } = parseCrmImportFile(await file.arrayBuffer(), file.name);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            skippedRows > 0
              ? "Nessuna riga valida trovata nel file. Controlla il template e riprova."
              : "Il file non contiene contatti importabili.",
        },
        { status: 400 },
      );
    }

    const planAccess = await checkPlanResourceLimit(supabase, {
      userId: user.id,
      planId: normalizePlanId(accountProfile?.subscription_tier),
      resource: "crmClients",
      incomingUnits: rows.length,
    });

    if (!planAccess.allowed) {
      return NextResponse.json(
        {
          error: planAccess.message,
          upgradePlan: planAccess.upgradePlan,
          upgradeUrl: planAccess.upgradeUrl,
        },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("clients")
      .insert(
        rows.map((row) => ({
          user_id: user.id,
          ...row,
        })),
      )
      .select("*");

    if (error) {
      throw error;
    }

    return NextResponse.json({
      clients: data ?? [],
      importedCount: data?.length ?? 0,
      skippedRows,
    });
  } catch (error) {
    console.error("Import clients error:", error);
    return NextResponse.json({ error: "Errore durante l'import dei contatti." }, { status: 500 });
  }
}
