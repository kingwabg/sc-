"use client";

/**
 * 아동 카드 탭 — 서창지역아동센터 표준 양식 기준.
 * PDF mockup: ~/Downloads/아동카드.pdf
 *
 * 레이아웃:
 *   1) 상단 — 제목(아동카드) + 결재(생활복지사/센터장) + 연도 셀렉터/인쇄 버튼
 *   2) 인쇄 영역 — A4-portrait 스타일 borderd grid document
 *      - 신분 헤더 (대상자번호/대상자명/생년월일/입소이용구분/입소이용일자/퇴소종결일자 + 사진)
 *      - 카드 메타 (아동카드번호/신원구분/신원확인/입소의뢰기관)
 *      - 신체 (신장/몸무게/체격/얼굴형/두발색상/두발형태/182신고/기타특징)
 *      - 자유 기술 (조치사항/아동비고/아동안전환경/아동학교생활/상담자관찰/지도판정/급품지급)
 *      - 작성 푸터 (작성자/소속/직위/작성년월일)
 *      - 출력 메타 (출력시설명/출력자명/출력일자)
 */
import { useMemo } from "react";
import { FileText, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Child, CareLog } from "@/lib/features/children/types";
import { gradeForYear, ageForYear } from "./gradeForYear";

type ChildCardTabProps = {
  child: Child;
  childTone: string;
  year: number;
  setYear: (y: number) => void;
  yearTotals: { present: number; absent: number; leave: number; sick: number; rate: number };
  careLogs: CareLog[];
};

export function ChildCardTab({
  child,
  childTone,
  year,
  setYear,
  careLogs,
}: ChildCardTabProps) {
  const enrolledYear = parseInt((child.enrolledAt || "").slice(0, 4));
  const currentYear = new Date().getFullYear();
  const startYear = child.previousEnrolledAt
    ? parseInt(child.previousEnrolledAt.slice(0, 4))
    : enrolledYear;
  const years: number[] = [];
  for (let y = startYear; y <= currentYear + 1; y++) years.push(y);

  const gradeAtYear = gradeForYear(child, year);
  const ageAtYear = ageForYear(child.birthDate, year);

  // 관찰 메모가 비어 있을 때만 돌봄일지 메모로 폴백
  const observations = child.observations;
  const fallbackNotes = useMemo(() => {
    if (observations?.notes || observations?.safetyEnv || observations?.schoolLife) return null;
    const yearLogs = careLogs.filter((l) => l.date.startsWith(`${year}-`));
    if (!yearLogs.length) return null;
    return yearLogs
      .slice(0, 3)
      .map((l) => `[${l.date}] ${l.title}: ${l.content}`)
      .join("\n");
  }, [observations, careLogs, year]);

  return (
    <>
      {/* 상단 컨트롤 바 (인쇄 시 숨김) */}
      <div className="no-print flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex bg-white border border-slate-200 rounded-[10px] p-0.5 shadow-sm text-xs">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={cn(
                "px-3 h-8 rounded-md font-medium transition",
                year === y ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50",
              )}
            >
              {y}년
            </button>
          ))}
        </div>
        <button
          onClick={() => window.print()}
          className="h-9 px-3 bg-blue-600 text-white text-[13px] font-semibold rounded-[10px] hover:bg-blue-700 transition inline-flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          인쇄
        </button>
      </div>

      {/* ─── 인쇄 영역: A4-portrait 스타일 공식 기록 카드 ─── */}
      <div className="print-area">
        <CardFrame>
          {/* ─── 1) 제목 + 결재 ─── */}
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-[22px] font-bold text-slate-900 underline underline-offset-4 m-0">
              아동카드
            </h1>
            <ApprovalBlock />
          </div>

          {/* ─── 2) 신분 헤더 (6 fields + 사진) ─── */}
          <Section>
            <div className="flex">
              <div className="flex-1">
                <TableGrid rows={[
                  [{ label: "대상자번호", value: child.card ? formatCardNumber(child.id) : "—" }, { label: "대상자명", value: child.name }],
                  [{ label: "생년월일", value: child.birthDate }, { label: "입소이용구분", value: child.serviceType ?? "이용" }],
                  [{ label: "입소/이용일자", value: child.enrolledAt }, { label: "퇴소/종결일자", value: child.leftAt ?? "" }],
                ]} />
              </div>
              <div className="w-[110px] h-[130px] border border-slate-400 ml-2 grid place-items-center bg-slate-50 shrink-0">
                {child.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={child.photoUrl} alt={child.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-[11px]">(사진)</span>
                )}
              </div>
            </div>
          </Section>

          {/* ─── 3) 카드 메타 (4 fields: 카드번호/신원구분/신원확인/입소의뢰기관) ─── */}
          <Section>
            <TableGrid
              cols={4}
              rows={[
                [
                  { label: "아동카드번호", value: child.card?.number ?? "" },
                  { label: "신원구분", value: child.card?.identityType ?? "" },
                  { label: "신원확인", value: child.card?.identityVerified ?? "" },
                  { label: "입소의뢰기관", value: child.card?.referredBy ?? "" },
                ],
              ]}
            />
          </Section>

          {/* ─── 4) 신체 (8 fields) ─── */}
          <Section>
            <div className="border border-slate-300 text-[11px]">
              <div className="grid grid-cols-8 bg-slate-100 font-semibold text-slate-700">
                <BodyCellHead>신장</BodyCellHead>
                <BodyCellHead>몸무게</BodyCellHead>
                <BodyCellHead>체격</BodyCellHead>
                <BodyCellHead>얼굴형</BodyCellHead>
                <BodyCellHead>두발색상</BodyCellHead>
                <BodyCellHead>두발형태</BodyCellHead>
                <BodyCellHead>182신고유무</BodyCellHead>
                <BodyCellHead>기타신체특징</BodyCellHead>
              </div>
              <div className="grid grid-cols-8 text-[12px] text-slate-900 border-t border-slate-300">
                <BodyCellVal>{child.physical?.height != null ? `${child.physical.height} cm` : "\u00A0"}</BodyCellVal>
                <BodyCellVal>{child.physical?.weight != null ? `${child.physical.weight} kg` : "\u00A0"}</BodyCellVal>
                <BodyCellVal>{child.physical?.buildType || "\u00A0"}</BodyCellVal>
                <BodyCellVal>{child.physical?.faceShape || "\u00A0"}</BodyCellVal>
                <BodyCellVal>{child.physical?.hairColor || "\u00A0"}</BodyCellVal>
                <BodyCellVal>{child.physical?.hairStyle || "\u00A0"}</BodyCellVal>
                <BodyCellVal>{child.physical?.reported182 || "\u00A0"}</BodyCellVal>
                <BodyCellVal>{child.physical?.otherFeatures || "\u00A0"}</BodyCellVal>
              </div>
            </div>
          </Section>

          {/* ─── 5) 자유 기술 (label + multi-line value) ─── */}
          <Section>
            <FreeField label="조치사항" value={observations?.actionsTaken} />
            <FreeField label="아동비고사항" value={observations?.notes ?? fallbackNotes ?? undefined} />
            <FreeField label="아동안전환경" value={observations?.safetyEnv} />
            <FreeField label="아동학교생활" value={observations?.schoolLife} />
            <FreeField label="상담자의 관찰자의견" value={observations?.counselorObs} />
            <FreeField label="지도·판정" value={observations?.guidanceJudgement} />
            <FreeField label="급품지급사항" value={observations?.goodsProvision} />
          </Section>

          {/* ─── 6) 작성 푸터 ─── */}
          <Section>
            <div className="grid grid-cols-[110px_1fr_60px_1fr_60px_1fr_110px_1fr] border border-slate-300 text-[12px]">
              <Cell className="bg-slate-100 font-semibold" label>아동카드작성</Cell>
              <Cell value>{child.writtenBy?.name ?? ""}</Cell>
              <Cell className="bg-slate-100 font-semibold" label>소속</Cell>
              <Cell value>{child.writtenBy?.org ?? ""}</Cell>
              <Cell className="bg-slate-100 font-semibold" label>직위</Cell>
              <Cell value>{child.writtenBy?.position ?? ""}</Cell>
              <Cell className="bg-slate-100 font-semibold" label>작성년월일</Cell>
              <Cell value>{child.writtenBy?.writtenAt ?? ""}</Cell>
            </div>
          </Section>

          {/* ─── 7) 출력 메타 (footer) ─── */}
          <div className="mt-6 pt-3 border-t border-slate-300 grid grid-cols-3 text-[11px] text-slate-600 gap-2">
            <div>
              <span className="text-slate-400">출력시설명:</span> 서창지역아동센터(양산애사희적합동조합)
            </div>
            <div>
              <span className="text-slate-400">출력자명:</span> {child.writtenBy?.name ?? "—"}
            </div>
            <div className="text-right">
              <span className="text-slate-400">출력일자:</span> {todayYmd()}
            </div>
          </div>

          {/* 인쇄 시에만 보이는 푸터 안내 */}
          <p className="hidden print:block mt-4 text-[10px] text-slate-400">
            ※ 본 문서는 아동복지법 시행령 제27조에 따른 아동복지시설 기록 양식입니다.
          </p>
        </CardFrame>
      </div>
    </>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────

function formatCardNumber(id: string): string {
  // 기존 데이터 호환: id가 "c01"이면 "U2026..." 같은 형식이 없으므로 표시하지 않음
  return id.startsWith("U") ? id : `TEMP-${id}`;
}

function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

// ─── presentational sub-components ───────────────────────────────────

function CardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-300 shadow-card p-6 print:shadow-none print:border-0 print:p-2">
      {children}
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 last:mb-0">{children}</div>;
}

function Cell({
  children,
  label,
  value,
  className,
}: {
  children: React.ReactNode;
  label?: boolean;
  value?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 border-r border-slate-300 last:border-r-0 min-h-[28px] flex items-center",
        label && "bg-slate-100 font-semibold text-slate-700",
        value && "text-slate-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

type FieldCell = { label: string; value: React.ReactNode };

// Tailwind static class lookup — dynamic `grid-cols-${n}` 는 빌드 시 생성 안 됨
const GRID_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  6: "grid-cols-6",
  8: "grid-cols-8",
};

function TableGrid({
  rows,
  cols = 2,
}: {
  rows: FieldCell[][];
  cols?: number;
}) {
  const colsClass = GRID_CLASS[cols] ?? "grid-cols-2";
  return (
    <div className="border border-slate-300 text-[12px]">
      {rows.map((row, ri) => (
        <div key={ri} className={cn("grid", colsClass, ri > 0 && "border-t border-slate-300")}>
          {row.map((cell, ci) => (
            <CellPair key={ci} label={cell.label} value={cell.value} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** 한 row 안에서 2개 셀 (label + value) 페어를 만듦 — cols=2일 때 */
function CellPair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <Cell label>{label}</Cell>
      <Cell value>
        {value || <span className="text-slate-300">{"\u00A0"}</span>}
      </Cell>
    </>
  );
}

function FreeField({ label, value }: { label: string; value?: string }) {
  const hasValue = !!value && value.trim().length > 0;
  return (
    <div className="grid grid-cols-[110px_1fr] border border-slate-300 border-t-0 first:border-t text-[12px]">
      <Cell label>{label}</Cell>
      <Cell value>
        <div className={cn("leading-relaxed whitespace-pre-wrap py-1 min-h-[44px]", !hasValue && "text-slate-300")}>
          {hasValue ? value : "　"}
        </div>
      </Cell>
    </div>
  );
}

function ApprovalBlock() {
  return (
    <div className="w-[200px] border border-slate-300 text-[11px]">
      <div className="grid grid-cols-[60px_1fr_1fr]">
        <Cell label>결재</Cell>
        <Cell className="text-center">생활복지사</Cell>
        <Cell className="text-center">센터장</Cell>
      </div>
      <div className="grid grid-cols-[60px_1fr_1fr] border-t border-slate-300">
        <Cell label>&nbsp;</Cell>
        <Cell value>
          <div className="h-[44px]" />
        </Cell>
        <Cell value>
          <div className="h-[44px]" />
        </Cell>
      </div>
    </div>
  );
}

/** 8-col 신체 행용 — 라벨/값 모두 좁은 패딩, 라벨은 slate-100 배경 */
function BodyCellHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-1.5 py-1.5 text-center border-r border-slate-300 last:border-r-0 bg-slate-100 text-slate-700 font-semibold whitespace-nowrap">
      {children}
    </div>
  );
}

function BodyCellVal({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-1.5 py-1.5 text-center border-r border-slate-300 last:border-r-0 text-slate-900">
      {children}
    </div>
  );
}