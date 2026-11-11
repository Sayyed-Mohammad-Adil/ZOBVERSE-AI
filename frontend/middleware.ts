import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard"];
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/features",
  "/how-it-works",
  "/about",
  "/info",
  "/security",
  "/pricing",
  "/resources",
  "/contact",
  "/product",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for auth token in cookies (set by login) or Authorization header
  const tokenCookie = request.cookies.get("access_token")?.value;

  // Also check localStorage-compatible Bearer token in cookie (set by client)
  const sessionToken = request.cookies.get("oj_session")?.value;

  if (!tokenCookie && !sessionToken) {
    // Redirect to login with the original destination as a callback
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).+)",
  ],
};
