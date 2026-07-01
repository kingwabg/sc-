// app/login/actions.ts — 로그인 관련 Server Actions
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * 로그인 (이메일/비밀번호).
 * 성공 시 "/" 로 이동, 실패 시 error 메시지 반환.
 */
export async function signInAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();
  if (!supabase) {
    // Supabase 미설정: dev mock 모드 — signIn은 SessionProvider client에서 처리
    return { error: "인증 서비스가 설정되지 않았습니다." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * 회원가입 (이메일/비밀번호).
 * Supabase Auth의 confirm 타입은 email (기본값) — 대시보드에서 확인 필요.
 */
export async function signUpAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string) || email.split("@")[0];

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 합니다." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: "인증 서비스가 설정되지 않았습니다." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    error: undefined,
  };
}

/**
 * 로그아웃.
 */
export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
