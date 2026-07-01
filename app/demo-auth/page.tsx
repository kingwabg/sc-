"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DemoAuthInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("to") || "/";

  useEffect(() => {
    const demoSession = {
      user: {
        id: "u_1",
        tenantId: "t_acme",
        email: "[email protected]",
        name: "김지민",
        role: "owner",
        department: "프로덕트팀",
        position: "팀장",
        avatarColor: "#4f46e5",
      },
      tenant: {
        id: "t_acme",
        slug: "acme",
        name: "Acme Inc.",
        logoColor: "#4f46e5",
        plan: "business",
        memberCount: 42,
        createdAt: new Date().toISOString(),
      },
      widgets: [
        { id: "w_mail", type: "mail", title: "메일", visible: true, x: 0, y: 0, w: 6, h: 4 },
        { id: "w_schedule", type: "schedule", title: "오늘 일정", visible: true, x: 6, y: 0, w: 6, h: 4 },
        { id: "w_approval", type: "approval", title: "결재 대기", visible: true, x: 0, y: 4, w: 4, h: 4 },
        { id: "w_todo", type: "todo", title: "할 일", visible: true, x: 4, y: 4, w: 4, h: 4 },
        { id: "w_files", type: "files", title: "최근 파일", visible: true, x: 8, y: 4, w: 4, h: 4 },
        { id: "w_notice", type: "notice", title: "공지사항", visible: false, x: 0, y: 8, w: 4, h: 4 },
        { id: "w_shortcut", type: "shortcut", title: "바로가기", visible: true, x: 0, y: 8, w: 12, h: 2 },
      ],
    };
    // window.location 사용 (전체 페이지 리로드 — 헤드리스 캡처에 더 안정적)
    localStorage.setItem("officex.session.v1", JSON.stringify(demoSession));
    // 미들웨어 인증 가드 통과용 쿠키 (middleware.ts와 동일한 이름).
    document.cookie = "officex-session=1; path=/; max-age=86400; SameSite=Lax";
    // 역할 분기 가드용 쿠키 — demo는 owner 역할
    document.cookie = "officex-role=owner; path=/; max-age=86400; SameSite=Lax";
    // 약간의 딜레이 후 페이지 이동 — 캡처 시간 확보
    setTimeout(() => {
      window.location.href = redirect;
    }, 100);
  }, [redirect, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
        <div className="text-sm text-text-muted">데모 세션 설정 중...</div>
      </div>
    </div>
  );
}

export default function DemoAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="text-sm text-text-muted">로딩...</div></div>}>
      <DemoAuthInner />
    </Suspense>
  );
}