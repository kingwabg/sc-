"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useTenant } from "@/lib/tenant-context";
import { useSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * app/exec/* 전체 레이아웃
 * - 인증 가드
 * - AppShell 감싸기 (ExecSidebar 자동 적용 — role === 'exec')
 * - 자식 페이지는 AppShell 불필요
 */
export default function ExecLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready } = useTenant();
  const { user } = useSession();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return <AppShell>{children}</AppShell>;
}
