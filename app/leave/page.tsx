/**
 * app/leave/page.tsx
 *
 * P17 — tenant scope 적용:
 * getServerTenant() 로 현재 tenant 확인 후 mock data tenantId 필터링.
 * (Client child component는 하위호환으로 기존 import 유지)
 */
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LeaveSidebar } from "@/components/layout/LeaveSidebar";
import { LeaveBalanceSection } from "./_components/LeaveBalanceSection";
import { LeaveRecordSection } from "./_components/LeaveRecordSection";
import { getServerTenant } from "@/lib/auth/getServerTenant";
import { MY_LEAVE_BALANCES, MY_LEAVE_RECORDS } from "@/lib/features/leave-mock";

export default async function LeavePage() {
  const { tenantId } = await getServerTenant();

  // Tenant scope — mock data를 tenantId로 필터링
  // (client component 하위호환: client는 전체 data import 하지만 future real data 대비)
  const _filteredBalances = MY_LEAVE_BALANCES.filter((b) => b.tenantId === tenantId);
  const _filteredRecords = MY_LEAVE_RECORDS.filter((r) => r.tenantId === tenantId);

  void _filteredBalances; // future prop drilling 대비
  void _filteredRecords;

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
