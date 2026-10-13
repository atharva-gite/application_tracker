import { readFile } from "node:fs/promises";
import path from "node:path";

import { AppError } from "@/lib/errors";
import { assertStorageKey } from "@/lib/storage/keys";
import type { StorageAdapter } from "@/lib/storage/types";

const DEMO_ROOT = path.join(process.cwd(), "demo-files");

function resolveDemoPath(key: string) {
  const normalized = assertStorageKey(key);
  const root = path.resolve(DEMO_ROOT);
  const resolved = path.resolve(root, normalized);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid storage key.");
  }
  return resolved;
}

export const bundledStorage: StorageAdapter = {
  async put() {
    throw new AppError(
      "INTERNAL_ERROR",
      "File storage is not configured.",
    );
  },
  async get(key: string) {
    try {
      return await readFile(resolveDemoPath(key));
    } catch {
      return null;
    }
  },
  async delete() {
    return;
  },
};
