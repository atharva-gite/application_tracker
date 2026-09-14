export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  if (process.env.VERCEL_ENV !== "production") {
    return;
  }

  const { getEmailDriver } = await import("@/lib/email");
  const { logger } = await import("@/lib/logger");

  if (!process.env.STORAGE_BUCKET || !process.env.STORAGE_ACCESS_KEY || !process.env.STORAGE_SECRET_KEY) {
    logger.warn("startup.storage.unconfigured");
  }
  if (getEmailDriver() === "console") {
    logger.warn("startup.email.console");
  }
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    logger.warn("startup.sentry.unconfigured");
  }
}

export async function onRequestError(
  error: { digest?: string } & Error,
  request: { path: string; method: string },
  context: { routePath?: string; routeType?: string },
) {
  const { reportError } = await import("@/lib/monitoring");
  await reportError(error, {
    route: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    digest: error.digest,
  });
}
