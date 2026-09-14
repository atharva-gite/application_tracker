import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { getStorageDriver, storage } from "@/lib/storage";
import { resolveStoragePath } from "@/lib/storage/local";

describe("resolveStoragePath", () => {
  it("keeps document keys under the upload root", () => {
    const resolved = resolveStoragePath("documents/user-1/resume.pdf");
    expect(resolved.startsWith(path.resolve(process.cwd(), ".data", "uploads"))).toBe(
      true,
    );
    expect(resolved.endsWith(`${path.sep}resume.pdf`)).toBe(true);
  });

  it("rejects path traversal", () => {
    expect(() => resolveStoragePath("../../etc/passwd")).toThrow("Invalid storage key.");
    expect(() => resolveStoragePath("documents/../../secret.pdf")).toThrow(
      "Invalid storage key.",
    );
  });
});

describe("storage driver", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses local disk unless S3 credentials are present", () => {
    vi.stubEnv("STORAGE_BUCKET", "");
    vi.stubEnv("STORAGE_ACCESS_KEY", "");
    vi.stubEnv("STORAGE_SECRET_KEY", "");
    expect(getStorageDriver()).toBe("local");
  });

  it("selects S3 when bucket and keys are configured", () => {
    vi.stubEnv("STORAGE_BUCKET", "pipeline-docs");
    vi.stubEnv("STORAGE_ACCESS_KEY", "key");
    vi.stubEnv("STORAGE_SECRET_KEY", "secret");
    expect(getStorageDriver()).toBe("s3");
  });

  it("refuses local disk on Vercel", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("STORAGE_BUCKET", "");
    vi.stubEnv("STORAGE_ACCESS_KEY", "");
    vi.stubEnv("STORAGE_SECRET_KEY", "");
    await expect(
      storage.put("documents/user-1/resume.pdf", Buffer.from("pdf")),
    ).rejects.toThrow("File storage is not configured.");
  });
});
