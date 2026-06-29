import { NextResponse, type NextRequest } from "next/server";

/**
 * 인증 가드 미들웨어 (Edge Runtime).
 *
 * - 쿠키 `officex-session`이 없으면 인증이 필요한 모든 경로를 `/login`으로 보낸다.
 *   (현재 mock 단계: 쿠키 값은 1/0 의미만 가짐. 추후 Supabase 세션 토큰으로 교체.)
 * - `/login`, `/signup`, `/demo-auth`는 인증 없이 접근 가능.
 * - 정적 자산(_next/*, 이미지, favicon 등)은 matcher에서 제외.
 *
 * 동기화 책임:
 *   - `lib/session.tsx`의 signIn/signOut, 그리고 SessionProvider의 hydration에서
 *     같은 이름의 쿠키를 set/clear 한다.
 *   - `app/demo-auth/page.tsx`는 localStorage에 직접 세션을 쓰므로 쿠키도 같이 set.
 */

const SESSION_COOKIE = "officex-session";

// 인증 없이 접근 가능한 경로 (정확히 일치)
const PUBLIC_PATHS = new Set<string>([
  "/login",
  "/signup",
  "/demo-auth",
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // Next.js 내부 자산은 matcher에서 걸러지지만, 안전망으로 한 번 더.
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/api/")) return true; // API 라우트는 자체 가드 책임
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 공개 경로는 그대로 통과.
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const hasSession = !!req.cookies.get(SESSION_COOKIE)?.value;

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 정적 자산/파일을 제외한 모든 요청에 적용.
// - `_next/static`, `_next/image`, `favicon.ico` 제외
// - 확장자가 있는 파일(이미지, css, js 등) 제외
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};