import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { assertStorageKey } from "@/lib/storage/keys";
import type { StorageAdapter } from "@/lib/storage/types";

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new AppError("INTERNAL_ERROR", "File storage is not configured.");
  }
  return value;
}

function createClient() {
  const endpoint = process.env.STORAGE_ENDPOINT;
  return new S3Client({
    region: process.env.STORAGE_REGION || "us-east-1",
    endpoint: endpoint || undefined,
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: required("STORAGE_ACCESS_KEY"),
      secretAccessKey: required("STORAGE_SECRET_KEY"),
    },
  });
}

let client: S3Client | undefined;

function getClient() {
  client ??= createClient();
  return client;
}

export const s3Storage: StorageAdapter = {
  async put(key: string, body: Buffer) {
    const storageKey = assertStorageKey(key);
    await getClient().send(
      new PutObjectCommand({
        Bucket: required("STORAGE_BUCKET"),
        Key: storageKey,
        Body: body,
      }),
    );
  },
  async get(key: string) {
    const storageKey = assertStorageKey(key);
    try {
      const response = await getClient().send(
        new GetObjectCommand({
          Bucket: required("STORAGE_BUCKET"),
          Key: storageKey,
        }),
      );
      if (!response.Body) {
        return null;
      }
      return Buffer.from(await response.Body.transformToByteArray());
    } catch (error) {
      if (isNotFound(error)) {
        return null;
      }
      logger.error("storage.s3.get.failed", { key: storageKey });
      throw error;
    }
  },
  async delete(key: string) {
    const storageKey = assertStorageKey(key);
    try {
      await getClient().send(
        new DeleteObjectCommand({
          Bucket: required("STORAGE_BUCKET"),
          Key: storageKey,
        }),
      );
    } catch {
      // Missing objects should not fail a document delete.
    }
  },
};

function isNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error.name === "NoSuchKey" || error.name === "NotFound")
  );
}
