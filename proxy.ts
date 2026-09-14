import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const APP_PREFIXES = [
  "/dashboard",
  "/applications",
  "/companies",
  "/contacts",
  "/interviews",
  "/resumes",
  "/analytics",
];
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });
  const { pathname } = request.nextUrl;
  const isAppRoute = APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );

  if (isAppRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("x-request-id", requestId);
    return response;
  }

  if (isAuthPage && token) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.headers.set("x-request-id", requestId);
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/applications/:path*",
    "/companies/:path*",
    "/contacts/:path*",
    "/interviews/:path*",
    "/resumes/:path*",
    "/analytics/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
