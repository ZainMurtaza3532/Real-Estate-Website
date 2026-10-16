import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/signup");

  const isAgentOrAdminRoute =
    nextUrl.pathname.startsWith("/dashboard");

  const isUserProtectedRoute =
    nextUrl.pathname.startsWith("/profile") ||
    nextUrl.pathname.startsWith("/favorites");

  // 1. If logged-in user visits /login or /signup, redirect to appropriate destination
  if (isAuthRoute) {
    if (isLoggedIn) {
      if (userRole === "AGENT" || userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
      return NextResponse.redirect(new URL("/profile", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Protect /dashboard and /dashboard/* (AGENT and ADMIN only)
  if (isAgentOrAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }

    if (userRole !== "AGENT" && userRole !== "ADMIN") {
      // Non-agent/admin (e.g. BUYER) redirected to profile with an unauthorized notice
      return NextResponse.redirect(
        new URL("/profile?notice=unauthorized_agent_access", nextUrl)
      );
    }

    return NextResponse.next();
  }

  // 3. Protect /profile and /favorites (any authenticated user)
  if (isUserProtectedRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    "/login",
    "/signup",
  ],
};
