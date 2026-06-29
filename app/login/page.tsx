"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SessionProvider, useSession } from "@/lib/session";
import { toast } from "@/components/ui/toaster";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";

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
      router.push("/home");
    }, 400);
  };

  const demo = () => {
    setLoading(true);
    setTimeout(() => {
      signIn("[email protected]", "김지민");
      router.push("/home");
    }, 200);
  };

  return (
    <div className="min-h-screen flex flex-1 bg-background">
      {/* 좌측 폼 */}
      <div className="flex-1 flex flex-col p-6 md:p-10 max-w-md mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
          <div className="mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold mb-4">
              O
            </div>
            <h1 className="text-2xl font-bold">로그인</h1>
            <p className="text-sm text-text-muted mt-1">회사 계정으로 이어서 진행해요</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-9 pr-10 rounded-lg border border-border bg-surface text-sm placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-text-muted hover:text-foreground"
                aria-label="비밀번호 보기"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-text-muted">로그인 상태 유지</span>
              </label>
              <a href="#" className="text-primary hover:underline">
                비밀번호를 잊으셨나요?
              </a>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-text-muted">또는</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={demo}
              disabled={loading}
            >
              <Sparkles className="h-4 w-4" />
              데모 계정으로 둘러보기
            </Button>
          </form>

          <p className="text-sm text-center mt-6 text-text-muted">
            아직 회사가 없으신가요?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              회사 만들기
            </Link>
          </p>
        </div>
      </div>

      {/* 우측 일러스트 */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-md text-white p-12">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-3">
            일 잘러의 시작
          </div>
          <h2 className="text-3xl font-bold leading-tight">
            흩어져 있던 업무 툴을<br />
            하나로 모았어요
          </h2>
          <p className="mt-4 text-white/80 leading-relaxed">
            메신저 탭, 결재 탭, 메일 탭을 왔다 갔다 하던 시간은 끝.
            필요한 건 전부 한 화면에서.
          </p>
          <div className="mt-8 flex gap-2">
            {["메일", "결재", "일정", "메신저"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium">
                {t}
              </span>
            ))}
          </div>
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