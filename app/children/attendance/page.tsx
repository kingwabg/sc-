"use client";

import { Suspense, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MOCK_CHILDREN } from "@/lib/children";
import {
  getAttendanceForMonth,
  monthlyStats,
  attendanceMap,
  businessDaysInMonth,
} from "@/lib/attendance";
import { getTenantSettings } from "@/lib/store";
import AbsenceReasonModal from "@/app/attendance/_components/AbsenceReasonModal";
import {
  AttendanceLedgerTable,
} from "./_components/AttendanceLedgerTable";
import { AttendanceLedgerToolbar } from "./_components/AttendanceLedgerToolbar";

export default function AttendanceLedgerPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <AttendanceLedgerBody />
      </Suspense>
    </AppShell>
  );
}

function AttendanceLedgerBody() {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);

  // ── 결석 사유서 모달 상태 ─────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalChildId, setModalChildId] = useState("");
  const [modalDate, setModalDate] = useState("");

  // ── 시설 정원 ───────────────────────────────────────────
  const facilityCapacity = (typeof window !== "undefined"
    ? getTenantSettings().capacity
    : 50) as 30 | 40 | 50;

  function openAbsenceModal(childId: string, date: string) {
    setModalChildId(childId);
    setModalDate(date);
    setModalOpen(true);
  }

  // ── Derived data ─────────────────────────────────────────
  const monthRows = useMemo(() => getAttendanceForMonth(year, month), [year, month]);
  const map = useMemo(() => attendanceMap(monthRows), [monthRows]);
  const stats = useMemo(() => monthlyStats(monthRows), [monthRows]);
  const bizDays = useMemo(() => businessDaysInMonth(year, month), [year, month]);
  const filteredChildren = useMemo(
    () => MOCK_CHILDREN.filter((c) => c.capacityGroup === facilityCapacity),
    [facilityCapacity],
  );

  // ── Month navigation ─────────────────────────────────────
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }
  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  const childName = MOCK_CHILDREN.find((c) => c.id === modalChildId)?.name ?? modalChildId;

  return (
    <div className="w-full max-w-[1100px] lg:max-w-[1280px] xl:max-w-[1500px]">
      <AttendanceLedgerToolbar
        year={year}
        month={month}
        bizDays={bizDays}
        facilityCapacity={facilityCapacity}
        filteredChildrenCount={filteredChildren.length}
        stats={stats}
        onYearChange={setYear}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
      />

      <AttendanceLedgerTable
        filteredChildren={filteredChildren}
        facilityCapacity={facilityCapacity}
        year={year}
        month={month}
        map={map}
        onAbsenceClick={openAbsenceModal}
      />

      {modalOpen && (
        <AbsenceReasonModal
          childId={modalChildId}
          childName={childName}
          date={modalDate}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            // Trigger re-render to pick up new reason data
            setYear((y) => y);
          }}
        />
      )}
    </div>
  );
}
