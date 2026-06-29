// lib/supabase/client.ts — 브라우저용 Supabase 클라이언트
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // 환경변수 없으면 null — 호출부에서 mock 데이터로 fallback
    return null;
  }

  return createBrowserClient<Database>(url, key);
}

// 환경변수 체크 헬퍼
export function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}