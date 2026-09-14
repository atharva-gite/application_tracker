import { expect, test } from "@playwright/test";

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

  await page.getByRole("link", { name: "Add application" }).click();
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
  await expect(page.getByText("Prepare graph algorithms")).toBeVisible();

  await page.getByLabel("Due").fill(localDateTime(48));
  await page.getByRole("button", { name: "Add follow-up" }).click();
  await expect(page.getByText(/Recruiter/i).first()).toBeVisible();

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
  await expect(page.getByText(/recruiter follow-up/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "1 Interview" })).toBeVisible();
});
