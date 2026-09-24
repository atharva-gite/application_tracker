export const PRODUCT_EVENTS = {
  signupCompleted: "signup_completed",
  applicationCreated: "application_created",
  applicationStatusChanged: "application_status_changed",
  interviewCreated: "interview_created",
  followUpCompleted: "follow_up_completed",
  csvImported: "csv_imported",
} as const;

export type ProductEventName = (typeof PRODUCT_EVENTS)[keyof typeof PRODUCT_EVENTS];

export const MANAGEMENT_EVENT_NAMES = [
  PRODUCT_EVENTS.applicationCreated,
  PRODUCT_EVENTS.applicationStatusChanged,
  PRODUCT_EVENTS.interviewCreated,
  PRODUCT_EVENTS.followUpCompleted,
  PRODUCT_EVENTS.csvImported,
] as const;
