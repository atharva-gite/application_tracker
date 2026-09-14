import type {
  Application,
  ApplicationStatusHistory,
  Company,
  Contact,
  Document,
  FollowUp,
  Interview,
  Note,
} from "@prisma/client";

import { formatDateOnly, formatDateTime } from "@/lib/domain";

export function serializeCompany(company: Company & { _count?: { applications: number } }) {
  return {
    id: company.id,
    name: company.name,
    website: company.website,
    industry: company.industry,
    location: company.location,
    notes: company.notes,
    applicationCount: company._count?.applications,
    createdAt: formatDateTime(company.createdAt),
    updatedAt: formatDateTime(company.updatedAt),
  };
}

export function serializeApplication(
  application: Application & { company: Company },
) {
  return {
    id: application.id,
    company: {
      id: application.company.id,
      name: application.company.name,
      website: application.company.website,
      location: application.company.location,
    },
    roleTitle: application.roleTitle,
    jobUrl: application.jobUrl,
    location: application.location,
    employmentType: application.employmentType,
    status: application.status,
    applicationDate: formatDateOnly(application.applicationDate),
    deadline: formatDateOnly(application.deadline),
    source: application.source,
    salaryMin: application.salaryMin,
    salaryMax: application.salaryMax,
    salaryCurrency: application.salaryCurrency,
    description: application.description,
    archivedAt: formatDateTime(application.archivedAt),
    createdAt: formatDateTime(application.createdAt),
    updatedAt: formatDateTime(application.updatedAt),
  };
}

export function serializeStatusHistory(entry: ApplicationStatusHistory) {
  return {
    id: entry.id,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    changedAt: formatDateTime(entry.changedAt),
  };
}

export function serializeContact(contact: Contact & { company?: Company | null }) {
  return {
    id: contact.id,
    company: contact.company
      ? { id: contact.company.id, name: contact.company.name }
      : null,
    name: contact.name,
    role: contact.role,
    email: contact.email,
    linkedinUrl: contact.linkedinUrl,
    createdAt: formatDateTime(contact.createdAt),
    updatedAt: formatDateTime(contact.updatedAt),
  };
}

export function serializeInterview(
  interview: Interview & {
    application?: (Application & { company: Company }) | null;
  },
) {
  return {
    id: interview.id,
    applicationId: interview.applicationId,
    application: interview.application
      ? {
          id: interview.application.id,
          roleTitle: interview.application.roleTitle,
          company: {
            id: interview.application.company.id,
            name: interview.application.company.name,
          },
        }
      : undefined,
    scheduledAt: formatDateTime(interview.scheduledAt),
    durationMinutes: interview.durationMinutes,
    type: interview.type,
    interviewerName: interview.interviewerName,
    meetingUrl: interview.meetingUrl,
    status: interview.status,
    outcome: interview.outcome,
    notes: interview.notes,
    createdAt: formatDateTime(interview.createdAt),
    updatedAt: formatDateTime(interview.updatedAt),
  };
}

export function serializeNote(note: Note) {
  return {
    id: note.id,
    applicationId: note.applicationId,
    content: note.content,
    createdAt: formatDateTime(note.createdAt),
    updatedAt: formatDateTime(note.updatedAt),
  };
}

export function serializeFollowUp(
  followUp: FollowUp & {
    application?: (Application & { company: Company }) | null;
  },
) {
  return {
    id: followUp.id,
    applicationId: followUp.applicationId,
    application: followUp.application
      ? {
          id: followUp.application.id,
          roleTitle: followUp.application.roleTitle,
          company: {
            id: followUp.application.company.id,
            name: followUp.application.company.name,
          },
        }
      : undefined,
    dueAt: formatDateTime(followUp.dueAt),
    type: followUp.type,
    note: followUp.note,
    completedAt: formatDateTime(followUp.completedAt),
    createdAt: formatDateTime(followUp.createdAt),
  };
}

export function serializeDocument(document: Document) {
  return {
    id: document.id,
    name: document.name,
    type: document.type,
    filename: document.filename,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    createdAt: formatDateTime(document.createdAt),
  };
}
