import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { serializeFollowUp } from "@/lib/serializers";
import type { FollowUpInput, FollowUpUpdateInput } from "@/lib/validation/follow-up";
import { followUpRepository } from "@/server/repositories/follow-up-repository";
import { applicationRepository } from "@/server/repositories/application-repository";
import { getOwnedApplication } from "@/server/services/application-service";

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
  const followUp = await followUpRepository.create(userId, applicationId, input);
  await applicationRepository.touch(applicationId);
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
  await getOwnedFollowUp(id, userId);
  const followUp = await followUpRepository.update(id, input);
  await applicationRepository.touch(followUp.applicationId);
  logger.info("follow_up.updated", { userId, followUpId: id });
  return serializeFollowUp(followUp);
}

export async function deleteFollowUp(userId: string, id: string) {
  await getOwnedFollowUp(id, userId);
  await followUpRepository.delete(id);
  logger.info("follow_up.deleted", { userId, followUpId: id });
  return { ok: true };
}
