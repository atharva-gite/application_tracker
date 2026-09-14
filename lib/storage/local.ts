import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { assertStorageKey } from "@/lib/storage/keys";
import type { StorageAdapter } from "@/lib/storage/types";

const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), ".data", "uploads");

function uploadRoot() {
  return process.env.UPLOAD_DIR || LOCAL_UPLOAD_ROOT;
}

export function resolveStoragePath(key: string) {
  const normalized = assertStorageKey(key);
  const rootResolved = path.resolve(/*turbopackIgnore: true*/ uploadRoot());
  const resolved = path.resolve(
    /*turbopackIgnore: true*/ rootResolved,
    normalized,
  );
  if (resolved !== rootResolved && !resolved.startsWith(`${rootResolved}${path.sep}`)) {
    throw new Error("Invalid storage key.");
  }
  return resolved;
}

export const localStorage: StorageAdapter = {
  async put(key: string, body: Buffer) {
    const filePath = resolveStoragePath(key);
    await mkdir(/*turbopackIgnore: true*/ path.dirname(filePath), {
      recursive: true,
    });
    await writeFile(/*turbopackIgnore: true*/ filePath, body);
  },
  async get(key: string) {
    try {
      return await readFile(/*turbopackIgnore: true*/ resolveStoragePath(key));
    } catch {
      return null;
    }
  },
  async delete(key: string) {
    try {
      await unlink(/*turbopackIgnore: true*/ resolveStoragePath(key));
    } catch {
      // Missing files should not fail a document delete.
    }
  },
};
