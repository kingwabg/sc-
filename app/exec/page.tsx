"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ExecClient } from "./_components/ExecClient";
import { useTenant } from "@/lib/tenant-context";
import { useSession } from "@/lib/session";

export default function ExecPage() {
  const router = useRouter();
  const { ready, tenant } = useTenant();
  const { user } = useSession();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return (
    <AppShell>
      <ExecClient />
    </AppShell>
  );
}
