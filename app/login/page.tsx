// app/login/page.tsx — 로그인 페이지 (Server Component)
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginForm from "./_components/LoginForm";

// 이미 인증된 사용자는 / 로 redirect
export default async function LoginPage() {
  const supabase = await createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect("/");
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">로딩 중...</div>}>
      <LoginForm />
    </Suspense>
  );
}
