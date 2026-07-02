"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────

export type StaffCareer = {
  id: string;
  staffId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
  orgName: string;
  position: string;
  jobDesc: string;
  recognition: string; // "100%" | "80%"
  notes: string;
};

// ─── Mock data ─────────────────────────────────────────────

const MOCK_CAREERS: StaffCareer[] = [
  {
    id: "c1",
    staffId: "s01",
    startDate: "2018-03-01",
    endDate: "2020-02-28",
    orgName: "서울사랑 Children's House",
    position: "사회복지사",
    jobDesc: "종합상담",
    recognition: "100%",
    notes: "",
  },
  {
    id: "c2",
    staffId: "s01",
    startDate: "2020-03-01",
    endDate: null,
    orgName: "양산애사희적합동조합",
    position: "팀장",
    jobDesc: "운영관리",
    recognition: "100%",
    notes: "",
  },
];

// ─── Helpers ───────────────────────────────────────────────

function calcGrade(careers: StaffCareer[]): number {
  let totalMonths = 0;
  for (const c of careers) {
    if (!c.startDate) continue;
    const start = new Date(c.startDate);
    const end = c.endDate ? new Date(c.endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const months = diffMs / (1000 * 60 * 60 * 24 * 30);
    const ratio = c.recognition === "80%" ? 0.8 : 1.0;
    totalMonths += months * ratio;
  }
  return Math.floor(totalMonths / 12);
}

function formatPeriod(start: string, end: string | null): string {
  const s = start.slice(0, 7);
  const e = end ? end.slice(0, 7) : "현재";
  return `${s} ~ ${e}`;
}

// ─── Props ─────────────────────────────────────────────────

type CareerTabProps = {
  staffId: string;
  careers?: StaffCareer[];
  onChange?: (careers: StaffCareer[]) => void;
};

// ─── Component ─────────────────────────────────────────────

export function CareerTab({ staffId, careers: propCareers, onChange }: CareerTabProps) {
  const [rows, setRows] = useState<StaffCareer[]>(
    propCareers ?? MOCK_CAREERS.filter((c) => c.staffId === staffId),
  );

  function update(id: string, field: keyof StaffCareer, value: string) {
    const next = rows.map((r) => (r.id === id ? { ...r, [field]: value } : r));
    setRows(next);
    onChange?.(next);
  }

  function addRow() {
    const today = new Date().toISOString().slice(0, 10);
    const newRow: StaffCareer = {
      id: `c_${Date.now()}`,
      staffId,
      startDate: today,
      endDate: null,
      orgName: "",
      position: "",
      jobDesc: "",
      recognition: "100%",
      notes: "",
    };
    setRows([...rows, newRow]);
  }

  function removeRow(id: string) {
    setRows(rows.filter((r) => r.id !== id));
  }

  const grade = useMemo(() => calcGrade(rows), [rows]);

  return (
    <div className="space-y-4">
      {/* 호봉 요약 */}
      <div className="flex items-center gap-3">
        <Card className="px-4 py-2 rounded-xl border border-slate-200 shadow-card">
          <span className="text-sm text-muted-foreground">총 경력</span>{" "}
          <span className="font-semibold text-foreground">
            {formatPeriod(rows[0]?.startDate ?? "", rows.find((r) => !r.endDate)?.endDate ?? null)}
          </span>
        </Card>
        <Card className="px-4 py-2 rounded-xl border border-slate-200 shadow-card">
          <span className="text-sm text-muted-foreground">산정호봉</span>{" "}
          <span className="font-semibold text-primary text-lg">{grade}호봉</span>
        </Card>
        <span className="text-xs text-muted-foreground ml-auto">
          * 1년 = 1호봉 / 인정율 80% 적용 시 0.8년으로 계산
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["기간", "근무처", "직위", "담당업무", "인정율", "비고", ""].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="px-3 py-2">
                  <div className="flex gap-1 items-center">
                    <input
                      type="date"
                      value={row.startDate}
                      onChange={(e) => update(row.id, "startDate", e.target.value)}
                      className="w-28 text-xs border border-border rounded px-1.5 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-muted-foreground">~</span>
                    <input
                      type="date"
                      value={row.endDate ?? ""}
                      onChange={(e) => update(row.id, "endDate", e.target.value || "")}
                      className="w-28 text-xs border border-border rounded px-1.5 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    value={row.orgName}
                    onChange={(e) => update(row.id, "orgName", e.target.value)}
                    placeholder="근무처명"
                    className="w-40 text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={row.position}
                    onChange={(e) => update(row.id, "position", e.target.value)}
                    placeholder="직위"
                    className="w-24 text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={row.jobDesc}
                    onChange={(e) => update(row.id, "jobDesc", e.target.value)}
                    placeholder="담당업무"
                    className="w-28 text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={row.recognition}
                    onChange={(e) => update(row.id, "recognition", e.target.value)}
                    className="text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="100%">100%</option>
                    <option value="80%">80%</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    value={row.notes}
                    onChange={(e) => update(row.id, "notes", e.target.value)}
                    placeholder="비고"
                    className="w-24 text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-danger"
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground text-sm">
                  경력 사항이 없습니다. 추가 버튼으로 등록하세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        경력 추가
      </Button>
    </div>
  );
}
