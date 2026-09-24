import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

function uniqueEmail() {
  return `e2e-${Date.now()}@example.com`;
}

function localDateTime(hoursAhead: number) {
  const date = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

test("student can manage the core job-search loop", async ({ page }) => {
  const email = uniqueEmail();
  const password = "password12";

  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Student");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");
  await page.getByRole("link", { name: "Log in" }).first().click();
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("link", { name: "Add application" }).first().click();
  await page.getByLabel("Company").fill("Google");
  await page.getByLabel("Role").fill("Software Engineering Intern");
  await page.getByRole("button", { name: "Add application" }).click();
  await expect(page).toHaveURL(/\/applications\/.+/);
  await expect(
    page.getByRole("heading", { name: "Software Engineering Intern" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Interview", exact: true }).click();
  await expect(page.getByText("Saved → Interview")).toBeVisible();

  await page.getByLabel("Date and time").fill(localDateTime(26));
  await page.getByLabel("Interviewer").fill("Jane Doe");
  await page.getByRole("button", { name: "Add interview" }).click();
  await expect(page.getByText("Jane Doe")).toBeVisible();

  await page.locator("#content").fill("Prepare graph algorithms");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(
    page.getByRole("paragraph").filter({ hasText: "Prepare graph algorithms" }),
  ).toBeVisible();

  await page.getByLabel("Due").fill(localDateTime(-2));
  await page.getByRole("button", { name: "Add follow-up" }).click();
  await expect(page.getByText("Follow up with recruiter").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Overdue" })).toBeVisible();

  await page.getByRole("link", { name: "Resumes" }).first().click();
  await page.getByPlaceholder("Resume - Software Engineering").fill("Resume - Backend");
  await page.locator('input[name="file"]').setInputFiles({
    name: "resume.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"),
  });
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.getByText("Resume - Backend")).toBeVisible();

  await page.getByRole("link", { name: "Dashboard" }).first().click();
  await expect(page.getByText("Google interview")).toBeVisible();
  await expect(page.getByText(/Follow up with recruiter/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "1 Interview" })).toBeVisible();

  await page.goto("/applications/import");
  await page.locator('input[name="file"]').setInputFiles({
    name: "applications.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      [
        "company,role,status,application_date,deadline,source,location,job_url",
        "Stripe,Backend Intern,APPLIED,2026-08-01,2026-10-01,Referral,Remote,https://stripe.com/jobs",
        "Bad Co,Broken Role,APPLIED,not-a-date,,,,",
      ].join("\n"),
    ),
  });
  await page.getByRole("button", { name: "Import" }).click();
  await expect(page.getByText("Imported 1 application")).toBeVisible();
  await expect(page.getByText("Row 3:")).toBeVisible();

  const exported = await page.request.get("/api/applications/export");
  expect(exported.ok()).toBe(true);
  const csv = await exported.text();
  expect(csv).toContain("Software Engineering Intern");
  expect(csv).toContain("Backend Intern");

  const account = await prisma.user.findUnique({ where: { email } });
  const imported = await prisma.application.findFirst({
    where: { userId: account?.id, roleTitle: "Backend Intern" },
  });
  expect(imported).toBeTruthy();
  await prisma.applicationStatusHistory.updateMany({
    where: { applicationId: imported?.id },
    data: { changedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
  });

  await page.goto("/dashboard");
  await expect(page.getByText("Stalled").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Stripe · Backend Intern" }).first()).toBeVisible();
  await expect(page.getByText(/days in Applied/)).toBeVisible();

  await page.goto("/settings");
  await page.getByLabel("Name").fill("E2E Student Updated");
  await page.getByLabel("Timezone").selectOption("Europe/London");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  await expect(page.getByLabel("Name")).toHaveValue("E2E Student Updated");
});
