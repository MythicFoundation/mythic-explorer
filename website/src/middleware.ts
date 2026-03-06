import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirect bare routes (e.g. /block/100, /address/XXX, /tx/XXX)
 * to their /mainnet equivalents so old links and direct URLs work.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bare routes without network prefix → redirect to /mainnet/...
  if (
    pathname.startsWith("/block/") ||
    pathname.startsWith("/address/") ||
    pathname.startsWith("/tx/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/mainnet${pathname}`;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/block/:path*", "/address/:path*", "/tx/:path*"],
};