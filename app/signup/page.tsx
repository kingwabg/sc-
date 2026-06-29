"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SessionProvider, useSession } from "@/lib/session";
import { toast } from "@/components/ui/toaster";
import { ArrowLeft, ArrowRight, Building2, User, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

function SignupForm() {
  const router = useRouter();
  const { signIn } = useSession();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // step 1: 회사
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [size, setSize] = useState<"1-10" | "11-50" | "51-200" | "200+">("1-10");

  // step 2: 관리자
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 20);

  const onCompanyChange = (v: string) => {
    setCompanyName(v);
    if (!slug || slug === slugify(companyName)) {
      setSlug(slugify(v));
    }
  };

  const next = () => {
    if (step === 1) {
      if (!companyName) return toast({ type: "error", message: "회사 이름을 입력해주세요" });
      setStep(2);
    } else if (step === 2) {
      if (!adminName || !adminEmail || !password)
        return toast({ type: "error", message: "모든 항목을 입력해주세요" });
      setStep(3);
    } else {
      setLoading(true);
      setTimeout(() => {
        // 새 워크스페이스 가입 흐름은 추후 Supabase 연동 시 구현
        // 현재는 데모로 바로 홈으로 이동
        signIn(adminEmail, adminName);
        toast({ type: "success", message: `${adminName}님 환영해요!` });
        router.push("/portal");
      }, 600);
    }
  };

  const steps = [
    { n: 1, label: "회사" },
    { n: 2, label: "관리자" },
    { n: 3, label: "완료" },
  ];

  return (
    <div className="min-h-screen flex flex-1 bg-background">
      <div className="flex-1 flex flex-col p-6 md:p-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          {/* 진행 표시 */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    step >= s.n
                      ? "bg-primary text-white"
                      : "bg-surface-muted text-text-muted"
                  )}
                >
                  {step > s.n ? <Check className="h-3.5 w-3.5" /> : s.n}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider">STEP {s.n}</div>
                  <div className={cn("text-xs font-medium", step >= s.n ? "text-foreground" : "text-text-muted")}>
                    {s.label}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("h-px flex-1", step > s.n ? "bg-primary" : "bg-border")} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold">우리 회사 만들기</h1>
                <p className="text-sm text-text-muted mt-1">회사에 어울리는 이름을 지어주세요</p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted">회사 이름</label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    value={companyName}
                    onChange={(e) => onCompanyChange(e.target.value)}
                    placeholder="Acme Inc."
                    className="w-full h-11 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted">워크스페이스 주소</label>
                <div className="mt-1 flex items-center h-11 rounded-lg border border-border bg-surface-muted/30 pl-3 pr-1">
                  <input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="acme"
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                  <span className="text-xs text-text-muted">.officex.app</span>
                </div>
                <p className="text-[11px] text-text-subtle mt-1">
                  직원들이 이 주소로 접속해요
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted">회사 규모</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {(["1-10", "11-50", "51-200", "200+"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={cn(
                        "h-10 rounded-lg border text-sm font-medium transition-colors",
                        size === s
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border bg-surface hover:bg-surface-muted"
                      )}
                    >
                      {s}명
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold">관리자 정보</h1>
                <p className="text-sm text-text-muted mt-1">회사 관리자(Owner) 계정을 만들어요</p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted">이름</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full h-11 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted">업무용 이메일</label>
                <div className="relative mt-1">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="[email protected]"
                    className="w-full h-11 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상"
                  className="mt-1 w-full h-11 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="h-16 w-16 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold">거의 다 됐어요!</h1>
              <p className="text-sm text-text-muted mt-2">
                <span className="font-semibold text-foreground">{companyName}</span> 워크스페이스를 만들고<br />
                <span className="font-semibold text-foreground">{adminEmail}</span>을 관리자로 등록합니다
              </p>
              <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">회사</span>
                  <span className="font-medium">{companyName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">주소</span>
                  <span className="font-medium">{slug}.officex.app</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">규모</span>
                  <span className="font-medium">{size}명</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">플랜</span>
                  <span className="font-medium text-primary">Free (30일 Pro 무료)</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-2">
            {step > 1 && step < 3 && (
              <Button variant="outline" onClick={() => setStep((s) => (s - 1) as Step)}>
                이전
              </Button>
            )}
            <Button onClick={next} className="flex-1" disabled={loading}>
              {loading ? "생성 중..." : step === 3 ? "워크스페이스 만들기" : "계속"}
              {step < 3 && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>

          {step === 1 && (
            <p className="text-sm text-center mt-6 text-text-muted">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                로그인
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <SessionProvider>
      <SignupForm />
    </SessionProvider>
  );
}