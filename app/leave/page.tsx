import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LeaveSidebar } from "@/components/layout/LeaveSidebar";
import { LeaveBalanceSection } from "./_components/LeaveBalanceSection";
import { LeaveRecordSection } from "./_components/LeaveRecordSection";

export default function LeavePage() {
  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-start">
        <Suspense fallback={null}>
          <LeaveSidebar />
        </Suspense>
        <div className="min-w-0 space-y-5">
          <LeaveBalanceSection />
          <LeaveRecordSection />
        </div>
      </div>
    </AppShell>
  );
}
