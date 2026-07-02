"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, LinkIcon, CheckCircle2, AlertCircle } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────

export type StaffTraining = {
  id: string;
  staffId: string;
  trainingName: string;
  startDate: string;
  endDate: string | null;
  hours: number | null;
  institution: string;
  certUrl: string;
  type: string; // "필수" | "선택"
};

// ─── Required education definitions ───────────────────────

const REQUIRED_EDUCATIONS = [
  { name: "아동학대 예방교육", hours: 6 },
  { name: "개인정보보호 교육", hours: 4 },
  { name: "안전교육", hours: 4 },
  { name: "성희롱 예방교육", hours: 4 },
  { name: "食品安全 교육", hours: 4 },
];

// ─── Mock data ─────────────────────────────────────────────

const MOCK_TRAININGS: StaffTraining[] = [
  {
    id: "t1",
    staffId: "s01",
    trainingName: "아동학대 예방교육",
    startDate: "2024-03-10",
    endDate: "2024-03-10",
    hours: 6,
    institution: "보건복지부",
    certUrl: "",
    type: "필수",
  },
  {
    id: "t2",
    staffId: "s01",
    trainingName: "개인정보보호 교육",
    startDate: "2024-06-15",
    endDate: "2024-06-15",
    hours: 4,
    institution: "한국정보보호협회",
    certUrl: "",
    type: "필수",
  },
  {
    id: "t3",
    staffId: "s01",
    trainingName: "사회복지사 역량강화 연수",
    startDate: "2024-09-01",
    endDate: "2024-09-03",
    hours: 12,
    institution: "한국사회복지사협회",
    certUrl: "",
    type: "선택",
  },
];

// ─── Props ─────────────────────────────────────────────────

type TrainingTabProps = {
  staffId: string;
  trainings?: StaffTraining[];
  onChange?: (trainings: StaffTraining[]) => void;
};

// ─── Component ─────────────────────────────────────────────

export function TrainingTab({ staffId, trainings: propTrainings, onChange }: TrainingTabProps) {
  const [rows, setRows] = useState<StaffTraining[]>(
    propTrainings ?? MOCK_TRAININGS.filter((t) => t.staffId === staffId),
  );

  function update(id: string, field: keyof StaffTraining, value: string | number | null) {
    const next = rows.map((r) => (r.id === id ? { ...r, [field]: value } : r));
    setRows(next);
    onChange?.(next);
  }

  function addRow() {
    const today = new Date().toISOString().slice(0, 10);
    const newRow: StaffTraining = {
      id: `t_${Date.now()}`,
      staffId,
      trainingName: "",
      startDate: today,
      endDate: today,
      hours: null,
      institution: "",
      certUrl: "",
      type: "선택",
    };
    setRows([...rows, newRow]);
  }

  function removeRow(id: string) {
    setRows(rows.filter((r) => r.id !== id));
  }

  // 누적 이수시간
  const totalHours = useMemo(
    () => rows.reduce((sum, r) => sum + (r.hours ?? 0), 0),
    [rows],
  );

  // 필수교육 체크
  const requiredStatus = useMemo(() => {
    const map: Record<string, { required: number; completed: number }> = {};
    for (const req of REQUIRED_EDUCATIONS) {
      map[req.name] = { required: req.hours, completed: 0 };
    }
    for (const row of rows) {
      if (map[row.trainingName] !== undefined) {
        map[row.trainingName].completed += row.hours ?? 0;
      }
    }
    return map;
  }, [rows]);

  const allRequiredMet = Object.values(requiredStatus).every((s) => s.completed >= s.required);

  function formatDateRange(start: string, end: string | null): string {
    if (!end || end === start) return start;
    return `${start} ~ ${end}`;
  }

  return (
    <div className="space-y-4">
      {/* 이수시간 요약 + 필수교육 체크 */}
      <div className="flex flex-wrap gap-3">
        <Card className="px-4 py-2 rounded-xl border border-slate-200 shadow-card">
          <span className="text-sm text-muted-foreground">누적 이수시간</span>{" "}
          <span className="font-semibold text-primary text-lg">{totalHours}시간</span>
        </Card>

        {REQUIRED_EDUCATIONS.map((req) => {
          const status = requiredStatus[req.name];
          const met = (status?.completed ?? 0) >= req.hours;
          return (
            <Card
              key={req.name}
              className={`px-3 py-1.5 rounded-xl border shadow-card flex items-center gap-1.5 ${
                met ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
              }`}
            >
              {met ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span className="text-xs font-medium">{req.name}</span>
              <span className="text-xs text-muted-foreground">
                {(status?.completed ?? 0)}/{req.hours}h
              </span>
            </Card>
          );
        })}

        <Card
          className={`px-3 py-1.5 rounded-xl border shadow-card ${
            allRequiredMet ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
          }`}
        >
          <span className="text-xs font-medium">
            {allRequiredMet ? "✓ 필수교육 완료" : "⚠ 필수교육 미이수"}
          </span>
        </Card>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["교육명", "기간", "이수시간", "교육기관", "수료증", "구분", ""].map((h) => (
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
                  <input
                    value={row.trainingName}
                    onChange={(e) => update(row.id, "trainingName", e.target.value)}
                    placeholder="교육명"
                    list={`training-suggestions-${row.id}`}
                    className="w-44 text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <datalist id={`training-suggestions-${row.id}`}>
                    {REQUIRED_EDUCATIONS.map((r) => (
                      <option key={r.name} value={r.name} />
                    ))}
                  </datalist>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 items-center">
                    <input
                      type="date"
                      value={row.startDate}
                      onChange={(e) => update(row.id, "startDate", e.target.value)}
                      className="w-28 text-xs border border-border rounded px-1.5 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-muted-foreground text-xs">~</span>
                    <input
                      type="date"
                      value={row.endDate ?? ""}
                      onChange={(e) => update(row.id, "endDate", e.target.value || "")}
                      className="w-28 text-xs border border-border rounded px-1.5 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={row.hours ?? ""}
                      onChange={(e) => update(row.id, "hours", e.target.value ? Number(e.target.value) : null)}
                      placeholder="0"
                      min={0}
                      className="w-14 text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-xs text-muted-foreground">h</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    value={row.institution}
                    onChange={(e) => update(row.id, "institution", e.target.value)}
                    placeholder="교육기관"
                    className="w-28 text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  {row.certUrl ? (
                    <a
                      href={row.certUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      보기
                    </a>
                  ) : (
                    <input
                      value={row.certUrl}
                      onChange={(e) => update(row.id, "certUrl", e.target.value)}
                      placeholder="URL 입력"
                      className="w-24 text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  <select
                    value={row.type}
                    onChange={(e) => update(row.id, "type", e.target.value)}
                    className="text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="필수">필수</option>
                    <option value="선택">선택</option>
                  </select>
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
                  교육 연수 기록이 없습니다. 추가 버튼으로 등록하세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          교육 추가
        </Button>
        <span className="text-xs text-muted-foreground">
          * 교육명 입력 시 필수교육 자동 제안됩니다
        </span>
      </div>
    </div>
  );
}
