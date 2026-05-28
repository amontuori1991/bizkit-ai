import { env, isResendConfigured } from "@/lib/env";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail(input: SendEmailInput) {
  if (!isResendConfigured()) {
    return {
      success: false,
      disabled: true,
      message: "Resend non configurato.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from ?? "BizKit AI <onboarding@resend.dev>",
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Invio email fallito: ${errorText}`);
  }

  return {
    success: true,
    disabled: false,
  };
}
