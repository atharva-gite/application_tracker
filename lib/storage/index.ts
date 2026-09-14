import { AppError } from "@/lib/errors";
import type { StorageAdapter, StorageDriver } from "@/lib/storage/types";

export { assertStorageKey } from "@/lib/storage/keys";
export type { StorageAdapter, StorageDriver };

export function isS3Configured() {
  return Boolean(
    process.env.STORAGE_BUCKET &&
      process.env.STORAGE_ACCESS_KEY &&
      process.env.STORAGE_SECRET_KEY,
  );
}

export function getStorageDriver(): StorageDriver {
  return isS3Configured() ? "s3" : "local";
}

async function getAdapter(): Promise<StorageAdapter> {
  if (isS3Configured()) {
    const { s3Storage } = await import("@/lib/storage/s3");
    return s3Storage;
  }
  if (process.env.VERCEL === "1") {
    throw new AppError(
      "INTERNAL_ERROR",
      "File storage is not configured.",
    );
  }
  const { localStorage } = await import("@/lib/storage/local");
  return localStorage;
}

export const storage: StorageAdapter = {
  async put(key, body) {
    const adapter = await getAdapter();
    return adapter.put(key, body);
  },
  async get(key) {
    const adapter = await getAdapter();
    return adapter.get(key);
  },
  async delete(key) {
    const adapter = await getAdapter();
    return adapter.delete(key);
  },
};
