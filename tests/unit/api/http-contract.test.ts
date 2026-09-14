import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/authorization/require-user", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/server/services/application-service", () => ({
  listApplications: vi.fn(),
  getApplication: vi.fn(),
  createApplication: vi.fn(),
  updateApplication: vi.fn(),
  archiveApplication: vi.fn(),
  changeApplicationStatus: vi.fn(),
  getApplicationHistory: vi.fn(),
}));

vi.mock("@/server/services/company-service", () => ({
  listCompanies: vi.fn(),
  getCompany: vi.fn(),
  createCompany: vi.fn(),
}));

vi.mock("@/server/services/interview-service", () => ({
  listApplicationInterviews: vi.fn(),
  createInterview: vi.fn(),
  updateInterview: vi.fn(),
  deleteInterview: vi.fn(),
}));

vi.mock("@/server/services/note-service", () => ({
  listApplicationNotes: vi.fn(),
  createNote: vi.fn(),
}));

vi.mock("@/server/services/document-service", () => ({
  getDocumentFile: vi.fn(),
  uploadDocument: vi.fn(),
}));

import { GET as healthGet } from "@/app/api/health/route";
import { POST as createApplication } from "@/app/api/applications/route";
import { GET as getCompany } from "@/app/api/companies/[id]/route";
import { POST as createCompany } from "@/app/api/companies/route";
import { GET as downloadDocument } from "@/app/api/documents/[id]/download/route";
import { POST as createInterview } from "@/app/api/applications/[id]/interviews/route";
import { POST as createNote } from "@/app/api/applications/[id]/notes/route";
import { POST as changeStatus } from "@/app/api/applications/[id]/status/route";
import { AppError, ErrorCode } from "@/lib/errors";
import { requireUser } from "@/server/authorization/require-user";
import { createApplication as createApplicationService } from "@/server/services/application-service";
import {
  createCompany as createCompanyService,
  getCompany as getCompanyService,
} from "@/server/services/company-service";
import { getDocumentFile } from "@/server/services/document-service";
import { createInterview as createInterviewService } from "@/server/services/interview-service";

const userA = { id: "user-a", email: "a@example.com" };

describe("API HTTP contract", () => {
  beforeEach(() => {
    vi.mocked(requireUser).mockReset();
    vi.mocked(createApplicationService).mockReset();
    vi.mocked(getCompanyService).mockReset();
    vi.mocked(createCompanyService).mockReset();
    vi.mocked(getDocumentFile).mockReset();
    vi.mocked(createInterviewService).mockReset();
  });

  it("reports health without authentication", async () => {
    const response = await healthGet(new Request("http://localhost:3000/api/health"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("rejects unauthenticated creates", async () => {
    vi.mocked(requireUser).mockRejectedValue(
      new AppError("UNAUTHORIZED", "You need to sign in to continue."),
    );
    const response = await createApplication(
      new Request("http://localhost:3000/api/applications", {
        method: "POST",
        body: JSON.stringify({
          companyName: "Google",
          roleTitle: "Intern",
        }),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("rejects invalid application payloads", async () => {
    vi.mocked(requireUser).mockResolvedValue(userA);
    const response = await createApplication(
      new Request("http://localhost:3000/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roleTitle: "Intern" }),
      }),
    );
    expect(response.status).toBe(422);
    expect((await response.json()).error.code).toBe(ErrorCode.VALIDATION_ERROR);
  });

  it("creates an application with 201", async () => {
    vi.mocked(requireUser).mockResolvedValue(userA);
    vi.mocked(createApplicationService).mockResolvedValue({
      id: "app-1",
      roleTitle: "Intern",
    } as never);
    const response = await createApplication(
      new Request("http://localhost:3000/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          companyName: "Google",
          roleTitle: "Intern",
        }),
      }),
    );
    expect(response.status).toBe(201);
  });

  it("rejects invalid status values", async () => {
    vi.mocked(requireUser).mockResolvedValue(userA);
    const response = await changeStatus(
      new Request("http://localhost:3000/api/applications/app-1/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "HIRED" }),
      }),
      { params: Promise.resolve({ id: "app-1" }) },
    );
    expect(response.status).toBe(422);
  });

  it("hides another user's company", async () => {
    vi.mocked(requireUser).mockResolvedValue(userA);
    vi.mocked(getCompanyService).mockRejectedValue(
      new AppError("NOT_FOUND", "Company not found."),
    );
    const response = await getCompany(
      new Request("http://localhost:3000/api/companies/co-b"),
      { params: Promise.resolve({ id: "co-b" }) },
    );
    expect(response.status).toBe(404);
  });

  it("returns 409 when a company name already exists", async () => {
    vi.mocked(requireUser).mockResolvedValue(userA);
    vi.mocked(createCompanyService).mockRejectedValue(
      new AppError("CONFLICT", "You already have a company with this name."),
    );
    const response = await createCompany(
      new Request("http://localhost:3000/api/companies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Google" }),
      }),
    );
    expect(response.status).toBe(409);
  });

  it("creates interviews with 201", async () => {
    vi.mocked(requireUser).mockResolvedValue(userA);
    vi.mocked(createInterviewService).mockResolvedValue({ id: "int-1" } as never);
    const response = await createInterview(
      new Request("http://localhost:3000/api/applications/app-1/interviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scheduledAt: "2026-09-17T10:00",
          type: "TECHNICAL",
        }),
      }),
      { params: Promise.resolve({ id: "app-1" }) },
    );
    expect(response.status).toBe(201);
  });

  it("rejects empty notes", async () => {
    vi.mocked(requireUser).mockResolvedValue(userA);
    const response = await createNote(
      new Request("http://localhost:3000/api/applications/app-1/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: "" }),
      }),
      { params: Promise.resolve({ id: "app-1" }) },
    );
    expect(response.status).toBe(422);
  });

  it("does not download another user's resume", async () => {
    vi.mocked(requireUser).mockResolvedValue(userA);
    vi.mocked(getDocumentFile).mockRejectedValue(
      new AppError("NOT_FOUND", "Document not found."),
    );
    const response = await downloadDocument(
      new Request("http://localhost:3000/api/documents/doc-b/download"),
      { params: Promise.resolve({ id: "doc-b" }) },
    );
    expect(response.status).toBe(404);
  });
});
