import { env, isResendConfigured } from "@/lib/env";
import {
  formatFeedbackCategory,
  formatFeedbackPriority,
  formatFeedbackStatus,
  type FeedbackItem,
  type FeedbackStatus,
} from "@/lib/feedback";
import { sendEmail } from "@/lib/resend";
import { readSiteSettings } from "@/lib/site-settings";

type NewFeedbackNotificationInput = {
  feedback: FeedbackItem;
  userEmail: string | null;
};

type FeedbackStatusNotificationInput = {
  feedback: FeedbackItem;
  userEmail: string | null;
  previousStatus: FeedbackStatus | null;
};

function buildFeedbackUrl(path: string) {
  return `${env.appUrl.replace(/\/$/, "")}${path}`;
}

export async function notifyAdminAboutNewFeedback(input: NewFeedbackNotificationInput) {
  if (!isResendConfigured()) {
    return;
  }

  const siteSettings = await readSiteSettings();
  const recipient = siteSettings.supportEmail || siteSettings.contactEmail;
  if (!recipient) {
    return;
  }

  await sendEmail({
    to: recipient,
    subject: `[BizKit AI] Nuovo feedback ${input.feedback.ticket_code ?? ""}`.trim(),
    html: `
      <h1>Nuovo feedback ricevuto</h1>
      <p><strong>Ticket:</strong> ${input.feedback.ticket_code ?? "N/D"}</p>
      <p><strong>Utente:</strong> ${input.userEmail ?? "N/D"}</p>
      <p><strong>Categoria:</strong> ${formatFeedbackCategory(input.feedback.category)}</p>
      <p><strong>Priorita:</strong> ${formatFeedbackPriority(input.feedback.priority)}</p>
      <p><strong>Titolo:</strong> ${input.feedback.title}</p>
      <p><strong>Descrizione:</strong></p>
      <p>${input.feedback.description.replace(/\n/g, "<br/>")}</p>
      <p><strong>Pagina:</strong> ${input.feedback.page_url ?? "N/D"}</p>
      <p><a href="${buildFeedbackUrl("/admin/feedback")}">Apri /admin/feedback</a></p>
    `,
  });
}

export async function notifyUserAboutFeedbackStatusChange(
  input: FeedbackStatusNotificationInput,
) {
  if (!isResendConfigured() || !input.userEmail) {
    return;
  }

  await sendEmail({
    to: input.userEmail,
    subject: `[BizKit AI] Aggiornamento feedback ${input.feedback.ticket_code ?? ""}`.trim(),
    html: `
      <h1>Aggiornamento feedback</h1>
      <p>Il tuo feedback <strong>${input.feedback.ticket_code ?? "N/D"}</strong> ha cambiato stato.</p>
      <p><strong>Titolo:</strong> ${input.feedback.title}</p>
      <p><strong>Stato precedente:</strong> ${formatFeedbackStatus(input.previousStatus)}</p>
      <p><strong>Nuovo stato:</strong> ${formatFeedbackStatus(input.feedback.status)}</p>
      ${
        input.feedback.admin_notes
          ? `<p><strong>Nota del team:</strong><br/>${input.feedback.admin_notes.replace(/\n/g, "<br/>")}</p>`
          : ""
      }
      <p>Puoi seguire lo storico qui:</p>
      <p><a href="${buildFeedbackUrl("/dashboard/feedback")}">Apri /dashboard/feedback</a></p>
    `,
  });
}

