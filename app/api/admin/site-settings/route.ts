import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { readSiteSettings, writeSiteSettings } from "@/lib/site-settings";

type SiteSettingsBody = {
  contactEmail?: string;
  supportEmail?: string;
  instagramHandle?: string;
  businessAvailability?: string;
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET() {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const settings = await readSiteSettings();
  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SiteSettingsBody;
  const contactEmail = body.contactEmail?.trim() ?? "";
  const supportEmail = body.supportEmail?.trim() ?? "";
  const instagramHandle = body.instagramHandle?.trim() ?? "";
  const businessAvailability = body.businessAvailability?.trim() ?? "";

  if (!isEmail(contactEmail)) {
    return NextResponse.json({ error: "Email contatti non valida." }, { status: 400 });
  }

  if (!isEmail(supportEmail)) {
    return NextResponse.json({ error: "Email supporto non valida." }, { status: 400 });
  }

  if (!instagramHandle) {
    return NextResponse.json({ error: "Inserisci un handle Instagram." }, { status: 400 });
  }

  if (!businessAvailability) {
    return NextResponse.json({ error: "Inserisci la disponibilita." }, { status: 400 });
  }

  try {
    const settings = await writeSiteSettings({
      contactEmail,
      supportEmail,
      instagramHandle,
      businessAvailability,
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossibile salvare le impostazioni del sito. Se sei in produzione, verifica che la tabella public.site_settings esista in Supabase e che SUPABASE_SERVICE_ROLE_KEY sia configurata correttamente.",
      },
      { status: 500 },
    );
  }
}
