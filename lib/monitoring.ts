import { logger } from "@/lib/logger";

type SentryDsn = {
  key: string;
  host: string;
  projectId: string;
};

export function parseSentryDsn(dsn: string): SentryDsn | null {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, "").split("/")[0];
    const key = url.username;
    if (!projectId || !key || !url.host) {
      return null;
    }
    return { key, host: url.host, projectId };
  } catch {
    return null;
  }
}

export async function sendSentryEvent(
  dsn: string,
  error: unknown,
  context?: Record<string, unknown>,
) {
  const parsed = parseSentryDsn(dsn);
  if (!parsed) {
    return;
  }

  const err = error instanceof Error ? error : new Error(String(error));
  const payload = {
    event_id: crypto.randomUUID().replaceAll("-", ""),
    timestamp: new Date().toISOString(),
    platform: "javascript",
    level: "error",
    environment:
      process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    message: err.message,
    exception: {
      values: [
        {
          type: err.name,
          value: err.message,
        },
      ],
    },
    extra: context,
  };

  const endpoint = `https://${parsed.host}/api/${parsed.projectId}/store/`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_client=pipeline/0.1.0, sentry_key=${parsed.key}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Sentry ingest failed with ${response.status}`);
  }
}

export async function reportError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  try {
    await sendSentryEvent(dsn, error, context);
  } catch {
    logger.warn("monitoring.sentry.failed");
  }
}
