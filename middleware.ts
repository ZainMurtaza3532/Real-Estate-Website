import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole =
    req.auth?.user?.role ||
    (req.auth as { role?: string })?.role ||
    (req.auth as { token?: { role?: string } })?.token?.role;

  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/signup");

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  const isSellRoute =
    nextUrl.pathname === "/sell" || nextUrl.pathname.startsWith("/sell/");

  const isAgentOrAdminRoute =
    nextUrl.pathname.startsWith("/dashboard");

  const isUserProtectedRoute =
    nextUrl.pathname.startsWith("/profile") ||
    nextUrl.pathname.startsWith("/favorites");

  // 1. Deprecate standalone /sell: Restrict buyers and route agents directly to Agent Dashboard
  if (isSellRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent("/dashboard/properties/new");
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }

    if (userRole === "SELLER" || userRole === "AGENT" || userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/properties/new", nextUrl));
    }

    // Buyers strictly restricted from selling views
    return NextResponse.redirect(new URL("/profile?notice=unauthorized_agent_access", nextUrl));
  }

  // 1. If logged-in user visits /login or /signup, redirect to callbackUrl or appropriate destination
  if (isAuthRoute) {
    if (isLoggedIn) {
      const callbackUrl = nextUrl.searchParams.get("callbackUrl");
      if (
        callbackUrl &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("/login") &&
        !callbackUrl.startsWith("/signup")
      ) {
        return NextResponse.redirect(new URL(callbackUrl, nextUrl));
      }
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
      if (userRole === "SELLER" || userRole === "AGENT") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
      return NextResponse.redirect(new URL("/profile", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Super Admin Dashboard: STRICTLY ADMIN only
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }

    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }

    return NextResponse.next();
  }

  // 3. Protect /dashboard and /dashboard/* (SELLER, AGENT, and ADMIN)
  if (isAgentOrAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }

    // Consolidate legacy /dashboard/seller routes into unified agent dashboard
    if (nextUrl.pathname.startsWith("/dashboard/seller")) {
      if (nextUrl.pathname.startsWith("/dashboard/seller/properties/new")) {
        return NextResponse.redirect(new URL("/dashboard/properties/new", nextUrl));
      }
      if (nextUrl.pathname.startsWith("/dashboard/seller/properties")) {
        return NextResponse.redirect(new URL("/dashboard/properties", nextUrl));
      }
      if (nextUrl.pathname.startsWith("/dashboard/seller/leads")) {
        return NextResponse.redirect(new URL("/dashboard/inquiries", nextUrl));
      }
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Allow authenticated users to access listing creation wizard
    if (nextUrl.pathname === "/dashboard/properties/new") {
      return NextResponse.next();
    }

    // For other dashboard routes, if token role is already SELLER/AGENT/ADMIN, proceed.
    // Otherwise, allow the server components (which have direct DB access) to verify up-to-date role
    // rather than prematurely bouncing users with stale JWT cookies to /profile.
    return NextResponse.next();
  }

  // 4. Protect /profile and /favorites (any authenticated user)
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
    "/admin/:path*",
    "/dashboard/:path*",
    "/sell",
    "/sell/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    "/login",
    "/signup",
  ],
};
