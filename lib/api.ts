import { NextResponse } from "next/server";
import { ZodError, flattenError } from "zod";

import { AppError, toErrorBody } from "@/lib/errors";
import { logger } from "@/lib/logger";

export function getRequestId(request: Request) {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function handleApi(
  request: Request,
  handler: () => Promise<Response>,
) {
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const route = new URL(request.url).pathname;

  try {
    const response = await handler();
    logRequest({
      requestId,
      method: request.method,
      route,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    const mapped = mapError(error);
    logRequest({
      requestId,
      method: request.method,
      route,
      status: mapped.status,
      durationMs: Date.now() - startedAt,
      errorCode: mapped.code,
    });

    if (mapped.code === "INTERNAL_ERROR") {
      logger.error("unhandled_api_error", {
        requestId,
        route,
        errorCode: mapped.code,
      });
    }

    const response = NextResponse.json(toErrorBody(mapped), {
      status: mapped.status,
    });
    response.headers.set("x-request-id", requestId);
    return response;
  }
}

export function json<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new AppError("VALIDATION_ERROR", "Request body must be valid JSON.");
  }
}

export { parseJsonBody };

function mapError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof ZodError) {
    return new AppError(
      "VALIDATION_ERROR",
      "Please correct the highlighted fields.",
      flattenError(error).fieldErrors,
    );
  }
  return new AppError("INTERNAL_ERROR", "Something went wrong. Please try again.");
}

function logRequest(fields: {
  requestId: string;
  method: string;
  route: string;
  status: number;
  durationMs: number;
  errorCode?: string;
}) {
  logger.info("http.request", fields);
}
