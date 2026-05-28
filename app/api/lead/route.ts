import { NextResponse } from "next/server";
import { env, isResendConfigured } from "@/lib/env";
import { isValidEmail, saveLead } from "@/lib/leads";
import { sendEmail } from "@/lib/resend";

type LeadBody = {
  email?: string;
  source?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as LeadBody;
    const email = body.email?.trim().toLowerCase();
    const source = body.source?.trim() || "unknown";

    if (!email) {
      return NextResponse.json({ error: "Email obbligatoria." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Inserisci un'email valida." }, { status: 400 });
    }

    const result = await saveLead({
      email,
      source,
      createdAt: new Date().toISOString(),
      asset: "10-prompt-ai-gratis-per-palestre",
    });

    let emailStatus: "sent" | "disabled" | "failed" = "disabled";

    if (isResendConfigured()) {
      try {
        await sendEmail({
          to: email,
          subject: "I tuoi 10 Prompt AI Gratis per Palestre",
          html: `
            <h1>BizKit AI</h1>
            <p>Grazie per aver richiesto il mini kit gratuito.</p>
            <p>Puoi scaricarlo qui:</p>
            <p><a href="${env.appUrl}/freebie/10-prompt-ai-gratis-per-palestre">Apri il download</a></p>
          `,
        });
        emailStatus = "sent";
      } catch (emailError) {
        console.error("Lead email error:", emailError);
        emailStatus = "failed";
      }
    }

    return NextResponse.json({
      success: true,
      alreadyExists: result.alreadyExists,
      message: "Controlla la tua email",
      redirectTo: "/freebie/10-prompt-ai-gratis-per-palestre",
      integrationsReadyFor: ["Resend", "Mailchimp", "ConvertKit"],
      emailStatus,
    });
  } catch (error) {
    console.error("Lead capture error:", error);

    return NextResponse.json(
      { error: "Si e verificato un errore durante il salvataggio del lead." },
      { status: 500 },
    );
  }
}
