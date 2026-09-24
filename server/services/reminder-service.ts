import type { EmailClient } from "@/lib/email";
import { getEmailClient } from "@/lib/email";
import { logger } from "@/lib/logger";
import { followUpRepository } from "@/server/repositories/follow-up-repository";
import { notificationRepository } from "@/server/repositories/notification-repository";
import { userRepository } from "@/server/repositories/user-repository";

export async function processDueFollowUpReminders(
  now = new Date(),
  emailClient: EmailClient = getEmailClient(),
) {
  const due = await notificationRepository.listDueFollowUpReminders(now);
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const notification of due) {
    if (!notification.entityId) {
      skipped += 1;
      continue;
    }

    const followUp = await followUpRepository.findById(notification.entityId);
    if (!followUp || followUp.completedAt) {
      await notificationRepository.cancelUnsentFollowUpReminder(notification.entityId);
      skipped += 1;
      continue;
    }

    const user = await userRepository.findById(notification.userId);
    if (!user?.email) {
      skipped += 1;
      continue;
    }

    const marked = await notificationRepository.markSent(notification.id, now);
    if (marked.count === 0) {
      skipped += 1;
      continue;
    }

    try {
      await emailClient.send({
        to: user.email,
        subject: notification.title,
        text: notification.message,
      });
      sent += 1;
    } catch {
      await notificationRepository.unmarkSent(notification.id);
      failed += 1;
      logger.error("follow_up.reminder.send_failed", {
        notificationId: notification.id,
        followUpId: notification.entityId,
      });
    }
  }

  logger.info("follow_up.reminders.processed", { sent, skipped, failed });
  return { sent, skipped, failed, considered: due.length };
}
