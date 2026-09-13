import { AppError } from "@/lib/errors";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function assertRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const existing = buckets.get(options.key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return;
  }

  if (existing.count >= options.limit) {
    throw new AppError(
      "RATE_LIMITED",
      "Too many attempts. Please wait and try again.",
    );
  }

  existing.count += 1;
}

export function resetRateLimitForTests() {
  buckets.clear();
}
