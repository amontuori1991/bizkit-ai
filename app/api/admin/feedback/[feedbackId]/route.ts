import { NextResponse } from "next/server";
import {
  createAdminFeedbackStatusEvent,
  deleteAdminFeedbackItem,
  getAdminFeedbackItem,
  getAdminFeedbackUserEmail,
  updateAdminFeedbackItem,
} from "@/lib/admin-feedback";
import { isFeedbackStatus } from "@/lib/feedback";
import { notifyUserAboutFeedbackStatusChange } from "@/lib/feedback-notifications";
import { requireAdminRequest } from "@/lib/admin-users";

type RouteContext = {
  params: Promise<{
    feedbackId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminRequest();
    const { feedbackId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      status?: string;
      adminNotes?: string | null;
    };

    if (!body.status && body.adminNotes === undefined) {
      return NextResponse.json({ error: "Nessun aggiornamento ricevuto." }, { status: 400 });
    }

    if (body.status && !isFeedbackStatus(body.status)) {
      return NextResponse.json({ error: "Stato feedback non valido." }, { status: 400 });
    }

    const previousFeedback = await getAdminFeedbackItem(feedbackId);
    const feedback = await updateAdminFeedbackItem(feedbackId, {
      status: body.status && isFeedbackStatus(body.status) ? body.status : undefined,
      adminNotes: body.adminNotes,
    });

    if (previousFeedback.status !== feedback.status) {
      await createAdminFeedbackStatusEvent({
        feedbackId: feedback.id,
        userId: feedback.user_id,
        fromStatus: previousFeedback.status,
        toStatus: feedback.status,
        noteSnapshot: feedback.admin_notes,
      });

      try {
        const userEmail = await getAdminFeedbackUserEmail(feedback.user_id);
        await notifyUserAboutFeedbackStatusChange({
          feedback,
          userEmail,
          previousStatus: previousFeedback.status,
        });
      } catch (notificationError) {
        console.error("Feedback status notification error:", notificationError);
      }
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof Error && error.message === "NON_AUTHORIZED") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    console.error("Admin feedback update route error:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del feedback." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminRequest();
    const { feedbackId } = await context.params;
    await deleteAdminFeedbackItem(feedbackId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NON_AUTHORIZED") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    console.error("Admin feedback delete route error:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione del feedback." },
      { status: 500 },
    );
  }
}
