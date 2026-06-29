"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Greeting } from "@/components/dashboard/Greeting";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { InboxCard } from "@/components/dashboard/InboxCard";
import { ApprovalCard } from "@/components/dashboard/ApprovalCard";
import { ScheduleCard } from "@/components/dashboard/ScheduleCard";
import { NoticeCard } from "@/components/dashboard/NoticeCard";
import { TeamAttendanceCard } from "@/components/dashboard/TeamAttendanceCard";
import { MyDocsCard } from "@/components/dashboard/MyDocsCard";
import { useTenant } from "@/lib/tenant-context";

export default function PortalHomePage() {
  const router = useRouter();
  const { ready, tenant } = useTenant();

  // If no tenant picked yet, bounce to selector
  useEffect(() => {
    if (ready && !tenant) router.replace("/");
  }, [ready, tenant, router]);

  if (!ready) {
    return null;
  }

  if (!tenant) {
    return null;
  }

  return (
    <AppShell>
      <Greeting />
      <StatStrip />
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <InboxCard />
        <ApprovalCard />
        <ScheduleCard />
        <NoticeCard />
        <TeamAttendanceCard />
        <MyDocsCard />
      </section>
    </AppShell>
  );
}