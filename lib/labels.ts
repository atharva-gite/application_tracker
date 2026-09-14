import { APPLICATION_STATUSES, EMPLOYMENT_TYPES } from "@/lib/validation/application";
import { DOCUMENT_TYPES } from "@/lib/validation/document";
import { FOLLOW_UP_TYPES } from "@/lib/validation/follow-up";
import { INTERVIEW_OUTCOMES, INTERVIEW_STATUSES, INTERVIEW_TYPES } from "@/lib/validation/interview";

export const statusLabels: Record<(typeof APPLICATION_STATUSES)[number], string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  ASSESSMENT: "Assessment",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const employmentLabels: Record<(typeof EMPLOYMENT_TYPES)[number], string> = {
  INTERNSHIP: "Internship",
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  OTHER: "Other",
};

export const interviewTypeLabels: Record<(typeof INTERVIEW_TYPES)[number], string> = {
  PHONE_SCREEN: "Phone screen",
  TECHNICAL: "Technical",
  BEHAVIORAL: "Behavioral",
  SYSTEM_DESIGN: "System design",
  ONSITE: "Onsite",
  OTHER: "Other",
};

export const interviewStatusLabels: Record<(typeof INTERVIEW_STATUSES)[number], string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const interviewOutcomeLabels: Record<(typeof INTERVIEW_OUTCOMES)[number], string> = {
  PENDING: "Pending",
  ADVANCED: "Advanced",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const followUpTypeLabels: Record<(typeof FOLLOW_UP_TYPES)[number], string> = {
  RECRUITER: "Recruiter",
  THANK_YOU: "Thank you",
  STATUS_CHECK: "Status check",
  OTHER: "Other",
};

export const documentTypeLabels: Record<(typeof DOCUMENT_TYPES)[number], string> = {
  RESUME: "Resume",
  COVER_LETTER: "Cover letter",
  OTHER: "Other",
};

export function toDateTimeLocal(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
