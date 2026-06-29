"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SessionProvider, useSession } from "@/lib/session";
import { toast } from "@/components/ui/toaster";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
  LayoutGrid,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ type: "error", message: "이메일과 비밀번호를 입력해주세요" });
      return;
    }
    setLoading(true);
    // 데모용 즉시 로그인
    setTimeout(() => {
      signIn(email);
      toast({ type: "success", message: `${email}로 로그인했어요` });
      router.push("/portal");
    }, 400);
  };

  const demo = () => {
    // /demo-auth 페이지가 localStorage + officex-session 쿠키를 한 번에 세팅하고
    // 쿼리 파라미터로 받은 경로로 redirect 해준다. 여기서 직접 signIn을 호출하면
    // 쿠키 동기화가 빠지므로 demo-auth 경유가 정석.
    router.push("/demo-auth?to=/portal");
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60">
      {/* 배경 mesh blobs — 은은한 분위기, 정렬은 중앙 카드를 향함 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-violet-200/20 blur-3xl" />
      </div>

      <div className="w-full max-w-[420px]">
        {/* 홈으로 — 카드 위에 작게 */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>

        {/* 메인 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/[0.04] border border-slate-200/60 p-8 sm:p-10">
          {/* 로고 + 브랜드 */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-lg shadow-brand-600/30">
              <LayoutGrid className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <div className="leading-tight">
              <div className="text-base font-bold text-slate-900 tracking-tight">
                Office
              </div>
              <div className="text-[11px] text-slate-500 -mt-0.5">
                임직원 포털
              </div>
            </div>
          </div>

          {/* 제목 */}
          <h1 className="text-[1.7rem] sm:text-2xl font-bold tracking-tight text-slate-900">
            로그인
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 mb-7">
            회사 계정으로 이어서 진행해요
          </p>

          {/* 폼 */}
          <form onSubmit={submit} className="space-y-3.5">
            {/* 이메일 */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            {/* 비밀번호 */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="비밀번호 보기"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* remember + forgot */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/30 focus:ring-offset-0"
                />
                <span>로그인 상태 유지</span>
              </label>
              <a
                href="#"
                className="text-slate-500 hover:text-brand-600 transition"
              >
                비밀번호를 잊으셨나요?
              </a>
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 mt-2 text-[15px] font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/20"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          {/* 또는 */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400">또는</span>
            </div>
          </div>

          {/* 데모 버튼 (로그인 아래) */}
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full h-12 text-[15px] font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            onClick={demo}
            disabled={loading}
          >
            <Sparkles className="h-4 w-4 text-brand-600" />
            데모 계정으로 둘러보기
          </Button>

          {/* 카드 내부 하단: 회사 만들기 */}
          <p className="text-sm text-center mt-7 text-slate-500">
            아직 회사가 없으신가요?{" "}
            <Link
              href="/signup"
              className="text-brand-600 font-semibold hover:underline"
            >
              회사 만들기
            </Link>
          </p>
        </div>

        {/* 카드 외부 하단: 모듈 칩 */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span className="px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/80">
            메일
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/80">
            결재
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/80">
            일정
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/80">
            메신저
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <LoginForm />
    </SessionProvider>
  );
}