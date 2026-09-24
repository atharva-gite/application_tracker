import { AppError } from "@/lib/errors";
import { getAppUrl } from "@/lib/env";
import { logger } from "@/lib/logger";
import { PRODUCT_EVENTS } from "@/lib/product-events";
import { productEventRepository } from "@/server/repositories/product-event-repository";
import { serializeFollowUp } from "@/lib/serializers";
import { followUpTypeLabels } from "@/lib/labels";
import { fromZonedDateTime, resolveTimeZone } from "@/lib/timezone";
import type { FollowUpInput, FollowUpUpdateInput } from "@/lib/validation/follow-up";
import { followUpRepository } from "@/server/repositories/follow-up-repository";
import { applicationRepository } from "@/server/repositories/application-repository";
import { notificationRepository } from "@/server/repositories/notification-repository";
import { getOwnedApplication } from "@/server/services/application-service";
import { userRepository } from "@/server/repositories/user-repository";

const DUPLICATE_WINDOW_MS = 30_000;

async function getOwnedFollowUp(id: string, userId: string) {
  const followUp = await followUpRepository.findById(id);
  if (!followUp) {
    throw new AppError("NOT_FOUND", "Follow-up not found.");
  }
  if (followUp.userId !== userId) {
    throw new AppError("NOT_FOUND", "Follow-up not found.");
  }
  return followUp;
}

async function userTimeZone(userId: string, override?: string | null) {
  if (override) {
    return resolveTimeZone(override);
  }
  const user = await userRepository.findById(userId);
  return resolveTimeZone(user?.timezone);
}

function dueDate(value: string, timeZone: string) {
  return fromZonedDateTime(value, timeZone);
}

function reminderCopy(followUp: {
  id: string;
  applicationId: string;
  type: keyof typeof followUpTypeLabels;
  dueAt: Date;
  note: string | null;
  application?: {
    roleTitle: string;
    company: { name: string };
  } | null;
}) {
  const typeLabel = followUpTypeLabels[followUp.type];
  const company = followUp.application?.company.name ?? "an application";
  const role = followUp.application?.roleTitle;
  const due = followUp.dueAt.toISOString();
  const url = `${getAppUrl()}/applications/${followUp.applicationId}`;
  const note = followUp.note ? `\n\n${followUp.note}` : "";
  return {
    title: `${typeLabel} · ${company}`,
    message: `${typeLabel} for ${role ? `${role} at ${company}` : company} is due at ${due}.${note}\n\n${url}\n`,
  };
}

async function syncReminder(
  followUp: {
    id: string;
    userId: string;
    applicationId: string;
    type: keyof typeof followUpTypeLabels;
    dueAt: Date;
    note: string | null;
    completedAt: Date | null;
    application?: {
      roleTitle: string;
      company: { name: string };
    } | null;
  },
  options: { resetSent: boolean },
) {
  if (followUp.completedAt) {
    await notificationRepository.cancelUnsentFollowUpReminder(followUp.id);
    return;
  }
  const copy = reminderCopy(followUp);
  await notificationRepository.upsertFollowUpReminder({
    userId: followUp.userId,
    followUpId: followUp.id,
    title: copy.title,
    message: copy.message,
    scheduledFor: followUp.dueAt,
    resetSent: options.resetSent,
  });
}

export async function listApplicationFollowUps(userId: string, applicationId: string) {
  await getOwnedApplication(applicationId, userId);
  const followUps = await followUpRepository.listForApplication(applicationId);
  return { followUps: followUps.map(serializeFollowUp) };
}

export async function listOpenFollowUps(userId: string) {
  const followUps = await followUpRepository.listOpen(userId, 50);
  return { followUps: followUps.map(serializeFollowUp) };
}

export async function createFollowUp(
  userId: string,
  applicationId: string,
  input: FollowUpInput,
) {
  await getOwnedApplication(applicationId, userId);
  const timeZone = await userTimeZone(userId, input.timeZone);
  const dueAt = dueDate(input.dueAt, timeZone);
  const note = input.note ?? null;

  const duplicate = await followUpRepository.findRecentDuplicate({
    userId,
    applicationId,
    type: input.type,
    dueAt,
    note,
    since: new Date(Date.now() - DUPLICATE_WINDOW_MS),
  });
  if (duplicate) {
    return serializeFollowUp(duplicate);
  }

  const followUp = await followUpRepository.create(userId, applicationId, input, dueAt);
  await applicationRepository.touch(applicationId);
  await syncReminder(followUp, { resetSent: true });
  logger.info("follow_up.created", {
    userId,
    applicationId,
    followUpId: followUp.id,
  });
  return serializeFollowUp(followUp);
}

export async function updateFollowUp(
  userId: string,
  id: string,
  input: FollowUpUpdateInput,
) {
  const existing = await getOwnedFollowUp(id, userId);
  const timeZone = await userTimeZone(userId, input.timeZone);
  const dueAt = input.dueAt ? dueDate(input.dueAt, timeZone) : undefined;
  const dueChanged = dueAt !== undefined && dueAt.getTime() !== existing.dueAt.getTime();

  if (input.completed === true && existing.completedAt) {
    return serializeFollowUp(existing);
  }

  const followUp = await followUpRepository.update(
    id,
    {
      type: input.type,
      note: input.note,
      completed: input.completed === true && existing.completedAt ? undefined : input.completed,
    },
    dueAt,
  );
  await applicationRepository.touch(followUp.applicationId);

  if (followUp.completedAt) {
    await notificationRepository.cancelUnsentFollowUpReminder(followUp.id);
    if (!existing.completedAt) {
      await productEventRepository.record({
        userId,
        name: PRODUCT_EVENTS.followUpCompleted,
        entityId: followUp.id,
      });
    }
  } else {
    await syncReminder(followUp, { resetSent: dueChanged });
  }

  logger.info("follow_up.updated", { userId, followUpId: id });
  return serializeFollowUp(followUp);
}

export async function completeFollowUp(userId: string, id: string) {
  return updateFollowUp(userId, id, { completed: true });
}

export async function deleteFollowUp(userId: string, id: string) {
  await getOwnedFollowUp(id, userId);
  await followUpRepository.delete(id);
  logger.info("follow_up.deleted", { userId, followUpId: id });
  return { ok: true };
}
