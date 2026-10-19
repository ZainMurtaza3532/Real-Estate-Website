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

  const userEmail = req.auth?.user?.email?.toLowerCase().trim();

  // Read strictly single admin email from environment
  const configuredAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const isDesignatedAdmin = !!configuredAdminEmail && !!userEmail && userEmail === configuredAdminEmail;

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

  // 2. If logged-in user visits /login or /signup, redirect to callbackUrl or appropriate destination
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
      if (userRole === "ADMIN" && isDesignatedAdmin) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
      if (userRole === "SELLER" || userRole === "AGENT") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
      return NextResponse.redirect(new URL("/properties", nextUrl));
    }
    return NextResponse.next();
  }

  // 3. Super Admin Dashboard: STRICTLY role === 'ADMIN' AND email matches the single ADMIN_EMAIL
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }

    if (userRole !== "ADMIN" || !isDesignatedAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }

    return NextResponse.next();
  }

  // 4. Protect /dashboard and /dashboard/*: strictly AGENT, SELLER, or ADMIN (Block BUYER)
  if (isAgentOrAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }

    // Strictly block BUYER and any non-agent/non-admin user from /dashboard
    const isAgentOrAdmin = userRole === "AGENT" || userRole === "SELLER" || userRole === "ADMIN";
    if (!isAgentOrAdmin) {
      return NextResponse.redirect(new URL("/profile?notice=unauthorized_agent_access", nextUrl));
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
