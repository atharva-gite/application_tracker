import path from "node:path";

export function assertStorageKey(key: string) {
  const normalized = path.posix.normalize(key.replaceAll("\\", "/"));
  if (
    !normalized ||
    normalized === "." ||
    normalized.startsWith("../") ||
    normalized === ".." ||
    path.posix.isAbsolute(normalized)
  ) {
    throw new Error("Invalid storage key.");
  }
  return normalized;
}
