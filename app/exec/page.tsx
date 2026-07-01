"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export default function ExecRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/exec/dashboard");
  }, [router]);

  return (
    <AppShell>
      <div className="flex items-center justify-center h-64 text-slate-400">
        임원 포털로 이동 중...
      </div>
    </AppShell>
  );
}
