const PUBLIC_EXACT_ROUTES = new Set(["/login", "/public", "/public/bio"]);
const PUBLIC_PREFIXES = ["/public/quotes/", "/public/bio/"];

const INTERNAL_API_PREFIX = "/api/internal/";

export function isFrameworkPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/brand/") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

export function isAuthApiPath(pathname: string): boolean {
  return pathname === "/api/auth/login" || pathname === "/api/auth/logout";
}

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_EXACT_ROUTES.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isPrivateApiPath(pathname: string): boolean {
  return pathname.startsWith(INTERNAL_API_PREFIX);
}

export function isPrivateRoute(pathname: string): boolean {
  if (isFrameworkPath(pathname) || isPublicRoute(pathname) || isAuthApiPath(pathname)) {
    return false;
  }

  if (pathname.startsWith("/api/")) {
    return isPrivateApiPath(pathname);
  }

  return true;
}
