export type StorageDriver = "local" | "s3";

export interface StorageAdapter {
  put(key: string, body: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}
