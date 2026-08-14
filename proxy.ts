import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  // Retrieve the session cookie
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // 1. If user is authenticated and trying to access the login page, redirect to studio
  if (sessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/studio", request.url));
  }

  // 2. If user is not authenticated and trying to access any studio path, redirect to login
  if (!sessionCookie && pathname.startsWith("/studio")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply proxy to studio and login routes
  matcher: ["/studio/:path*", "/login"],
};
