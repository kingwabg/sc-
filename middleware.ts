import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * 인증 + 역할 가드 미들웨어 (Edge Runtime).
 *
 * - Supabase `getUser()` 로 세션을 검증 (쿠키 기반).
 *   환경변수 미설정 시 dev mock 쿠키(`officex-session=1`)로 fallback.
 * - `/login`, `/signup`, `/demo-auth` 는 인증 없이 접근 가능.
 * - 정적 자산(_next/*, 이미지, favicon 등)은 matcher에서 제외.
 *
 * 역할 분기 가드:
 *   - `/admin/*`  → role = admin OR owner 만 통과 (owner도 포함)
 *   - `/exec/*`   → role = owner 만 통과
 *   - 그 외 페이지 → 모두 통과 (session만 있으면 OK)
 *
 * 동기화 책임:
 *   - `app/login/actions.ts` 의 signOutAction: Supabase 쿠키를 clear 한 뒤 redirect.
 *   - `lib/session.tsx` 의 signIn/signOut (client): localStorage + officex-session 쿠키 동기화.
 *   - `/demo-auth` page: localStorage + officex-session 쿠키를 한 번에 세팅.
 */

const SESSION_COOKIE = "officex-session";
const ROLE_COOKIE = "officex-role";
const DEV_MOCK_VALUE = "1";

const PUBLIC_PATHS = new Set<string>(["/login", "/signup", "/demo-auth"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/api/")) return true;
  return false;
}

type UserRole = "owner" | "admin" | "member";

function parseRoleFromCookie(request: NextRequest): UserRole {
  const role = request.cookies.get(ROLE_COOKIE)?.value as UserRole | undefined;
  if (role === "owner" || role === "admin" || role === "member") return role;
  return "member";
}

async function getSupabaseUser(
  request: NextRequest
): Promise<{ user: import("@supabase/supabase-js").User | null; supabase: ReturnType<typeof createServerClient> | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Dev fallback: officex-session 쿠키 사용
    const hasMockSession = request.cookies.get(SESSION_COOKIE)?.value === DEV_MOCK_VALUE;
    return { user: hasMockSession ? ({ id: "mock", email: "demo@office.com" } as any) : null, supabase: null };
  }

  // Supabase session 검증
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Edge Runtime: ResponseCookies에 직접 기록
        // (set-cookie 헤더로 전달됨)
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Dev bypass: Supabase 구성 됐지만 session 없으면 officex-session 쿠키 fallback
  // (/demo-auth 가 setting 한 쿠키로 들어오는 dev preview 흐름)
  if (!user && request.cookies.get(SESSION_COOKIE)?.value === DEV_MOCK_VALUE) {
    return {
      user: { id: "mock", email: "demo@office.com" } as any,
      supabase: null,
    };
  }

  return { user, supabase };
}

function redirectWithNext(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    // 이미 인증된 사용자가 /login 접근 시 → / 로 redirect
    if (pathname === "/login" || pathname === "/signup") {
      const { user } = await getSupabaseUser(request);
      if (user) {
        return redirectWithNext(request, "/");
      }
    }
    return NextResponse.next();
  }

  const { user } = await getSupabaseUser(request);

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // ── Role 분기 가드 ───────────────────────────────────────────
  const role = parseRoleFromCookie(request);

  if (pathname.startsWith("/admin")) {
    // /admin/* → owner 또는 admin만 통과
    if (role !== "owner" && role !== "admin") {
      return redirectWithNext(request, "/");
    }
  }

  if (pathname.startsWith("/exec")) {
    // /exec/* → owner만 통과
    if (role !== "owner") {
      return redirectWithNext(request, "/");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
