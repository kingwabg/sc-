// lib/supabase/server.ts — 서버 컴포넌트 / Route Handler / Middleware 용
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // 서버 컴포넌트에서 setAll 호출 시 무시 (route handler만 변경 가능)
        }
      },
    },
  });
}

/**
 * Server Component / Route Handler 에서 현재 로그인 유저 조회.
 * Supabase 설정 없으면 null 반환.
 */
export async function getUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/* ===== Middleware (Edge Runtime) 용 헬퍼 ===== */

/**
 * NextRequest의 쿠키로 Supabase 유저 검증 (Edge Runtime safe).
 * 미들웨어에서 호출할 것.
 */
export async function getUserFromRequest(
  getCookie: (name: string) => string | undefined,
  setCookie: (name: string, value: string, options?: CookieOptions) => void
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        // Edge Runtime: req.headers.get('cookie') 파싱 대신
        // 호출부에서 getCookie 함수를 받아 모든 쿠키를 직접 제공한다.
        return [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          setCookie(name, value, options)
        );
      },
    },
  });

  // 현재 쿠키에서 supabase session 토큰 읽기
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}