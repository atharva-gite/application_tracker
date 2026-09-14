import { shouldAdvanceToInterview } from "@/lib/analytics-math";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { serializeInterview } from "@/lib/serializers";
import type { InterviewInput, InterviewUpdateInput } from "@/lib/validation/interview";
import { interviewRepository } from "@/server/repositories/interview-repository";
import { applicationRepository } from "@/server/repositories/application-repository";
import {
  changeApplicationStatus,
  getOwnedApplication,
} from "@/server/services/application-service";

async function getOwnedInterview(id: string, userId: string) {
  const interview = await interviewRepository.findById(id);
  if (!interview) {
    throw new AppError("NOT_FOUND", "Interview not found.");
  }
  if (interview.application.userId !== userId) {
    throw new AppError("NOT_FOUND", "Interview not found.");
  }
  return interview;
}

export async function listApplicationInterviews(userId: string, applicationId: string) {
  await getOwnedApplication(applicationId, userId);
  const interviews = await interviewRepository.listForApplication(applicationId);
  return { interviews: interviews.map(serializeInterview) };
}

export async function listUpcomingInterviews(userId: string) {
  const interviews = await interviewRepository.listUpcoming(userId, 50);
  return { interviews: interviews.map(serializeInterview) };
}

export async function listUserInterviews(userId: string) {
  const interviews = await interviewRepository.listForUser(userId);
  return { interviews: interviews.map(serializeInterview) };
}

export async function getInterview(userId: string, id: string) {
  return serializeInterview(await getOwnedInterview(id, userId));
}

export async function createInterview(
  userId: string,
  applicationId: string,
  input: InterviewInput,
) {
  const application = await getOwnedApplication(applicationId, userId);
  const interview = await interviewRepository.create(applicationId, input);
  if (shouldAdvanceToInterview(application.status)) {
    await changeApplicationStatus(userId, applicationId, { status: "INTERVIEW" });
  } else {
    await applicationRepository.touch(applicationId);
  }
  logger.info("interview.created", {
    userId,
    applicationId,
    interviewId: interview.id,
  });
  return serializeInterview(interview);
}

export async function updateInterview(
  userId: string,
  id: string,
  input: InterviewUpdateInput,
) {
  const existing = await getOwnedInterview(id, userId);
  const nextStatus = input.status ?? existing.status;
  const patch: InterviewUpdateInput = { ...input };
  if (nextStatus === "COMPLETED" && patch.outcome === undefined && !existing.outcome) {
    patch.outcome = "PENDING";
  }
  const interview = await interviewRepository.update(id, patch);
  await applicationRepository.touch(interview.applicationId);
  logger.info("interview.updated", {
    userId,
    interviewId: id,
    applicationId: interview.applicationId,
  });
  return serializeInterview(interview);
}

export async function deleteInterview(userId: string, id: string) {
  await getOwnedInterview(id, userId);
  await interviewRepository.delete(id);
  logger.info("interview.deleted", { userId, interviewId: id });
  return { ok: true };
}
