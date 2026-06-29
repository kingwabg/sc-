"use client";

import { useState } from "react";
import { RichEditor } from "@/components/editor/RichEditor";
import {
  FileCheck2,
  ChevronDown,
  Paperclip,
  PaperclipIcon,
  X,
  Eye,
  Send,
  Save,
  RotateCcw,
  AlertCircle,
  User,
  Users,
  CalendarDays,
  Truck,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_STAFF, POSITION_LABELS } from "@/lib/staff";
import { APPROVAL_FORMS, APPROVAL_LINE } from "@/lib/data/approvals";
import type { ApprovalFormKey } from "@/lib/types/approval";

export function NewApprovalForm({ onClose }: { onClose?: () => void }) {
  const [formKey, setFormKey] = useState<ApprovalFormKey>("education");
  const [openFormPicker, setOpenFormPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 양식별 입력값
  const [title, setTitle] = useState("");
  const [educationType, setEducationType] = useState("");
  const [educationName, setEducationName] = useState("");
  const [educationCourse, setEducationCourse] = useState("");
  const [educationOrg, setEducationOrg] = useState("");
  const [educationCost, setEducationCost] = useState("");
  const [participantCost, setParticipantCost] = useState("");
  const [halfDayCount, setHalfDayCount] = useState("");
  const [sessions, setSessions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deliveryAddr, setDeliveryAddr] = useState("");
  const [overview, setOverview] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [preserveYears, setPreserveYears] = useState<number>(3);

  const draftAuthor = MOCK_STAFF.find((s) => s.id === "s02")!;
  const currentForm = APPROVAL_FORMS.find((f) => f.key === formKey) ?? APPROVAL_FORMS[0];
  const docNo = `${currentForm.label}-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    e.target.value = "";
  }
  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, ix) => ix !== i));
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-brand-600" />
          <h1 className="text-lg font-bold text-slate-900 m-0">새 결재 작성</h1>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-900 transition"
          >
            ← 결재 홈으로
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-0">
        {/* ─── 다우오피스 스타일 결재 양식 ─── */}
        <div className="lg:border-r border-slate-200">
          {/* 양식 헤더 */}
          <div className="text-center py-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 m-0">{currentForm.label}</h2>
          </div>

          {/* 양식 본문 — 좌측 메타 + 우측 결재선 */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] border-b border-slate-200">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <FormRow label="기안자" value={draftAuthor.name} />
                <FormRow label="소속" value="사회복지사" />
                <FormRow label="기안일" value="2026-06-29(월)" />
                <FormRow label="문서번호" value={docNo} />
              </tbody>
            </table>
            <div className="border-t md:border-t-0 md:border-l border-slate-200 px-4 py-3 flex md:flex-col gap-4 md:gap-2 md:min-w-[180px] bg-slate-50/40">
              <div className="hidden md:block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                결재선
              </div>
              {APPROVAL_LINE.map((s) => (
                <div key={s.step} className="flex items-center gap-2 md:gap-1.5">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold shrink-0",
                      s.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : s.status === "current"
                          ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300"
                          : "bg-slate-200 text-slate-500",
                    )}
                  >
                    {s.status === "approved" ? "✓" : s.step}
                  </div>
                  <div className="flex-1 min-w-0 md:flex-none">
                    <div className="text-[11px] font-bold text-slate-900 leading-tight">{s.name}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{s.position}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 양식별 필드 테이블 */}
          <table className="w-full text-sm border-collapse">
            <tbody>
              {formKey === "education" && (
                <>
                  <FormInputRow label="교육구분" value={educationType} onChange={setEducationType} />
                  <FormInputRow label="교육명도" value={educationName} onChange={setEducationName} />
                  <FormInputRow label="교육과정명" value={educationCourse} onChange={setEducationCourse} />
                  <FormInputRow label="교육기관" value={educationOrg} onChange={setEducationOrg} />
                  <FormTwoColRow
                    left={{ label: "교육비용", value: educationCost, onChange: setEducationCost }}
                    right={{ label: "참가비용", value: participantCost, onChange: setParticipantCost }}
                  />
                  <FormTwoColRow
                    left={{ label: "반차신청인원", value: halfDayCount, onChange: setHalfDayCount }}
                    right={{ label: "차수", value: sessions, onChange: setSessions }}
                  />
                  <FormTwoColRow
                    left={{ label: "교육시작일", value: startDate, onChange: setStartDate, type: "date" }}
                    right={{ label: "교육종료일", value: endDate, onChange: setEndDate, type: "date" }}
                  />
                </>
              )}
              {formKey === "leave" && (
                <>
                  <FormInputRow label="휴가종류" value={educationType} onChange={setEducationType} />
                  <FormTwoColRow
                    left={{ label: "휴가시작일", value: startDate, onChange: setStartDate, type: "date" }}
                    right={{ label: "휴가종료일", value: endDate, onChange: setEndDate, type: "date" }}
                  />
                  <FormInputRow label="사유" value={educationName} onChange={setEducationName} />
                </>
              )}
              {formKey === "expense" && (
                <>
                  <FormInputRow label="지출항목" value={educationType} onChange={setEducationType} />
                  <FormInputRow label="금액" value={educationCost} onChange={setEducationCost} />
                  <FormInputRow label="사용내역" value={educationName} onChange={setEducationName} />
                </>
              )}
              {formKey === "purchase" && (
                <>
                  <FormInputRow label="물품명" value={educationType} onChange={setEducationType} />
                  <FormInputRow label="수량" value={sessions} onChange={setSessions} />
                  <FormInputRow label="단가" value={educationCost} onChange={setEducationCost} />
                  <FormInputRow label="구매사유" value={educationName} onChange={setEducationName} />
                </>
              )}
              {formKey === "report" && (
                <>
                  <FormInputRow label="보고기간" value={educationType} onChange={setEducationType} />
                  <FormInputRow label="주요실적" value={educationName} onChange={setEducationName} />
                </>
              )}
              {formKey === "memo" && (
                <>
                  <FormInputRow label="품의제목" value={educationName} onChange={setEducationName} />
                  <FormInputRow label="관련근거" value={educationOrg} onChange={setEducationOrg} />
                </>
              )}
            </tbody>
          </table>

          {/* 제목 */}
          <div className="border-t border-slate-200 px-5 py-4">
            <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
              제목 <span className="text-red-500">*</span>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${currentForm.label} 제목을 입력하세요`}
              className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
            />
          </div>

          {/* 중앙 큰 에디터 */}
          <div className="border-t border-slate-200 px-5 py-4 bg-slate-50/30">
            <div className="text-[11px] font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>{formKey === "education" ? "교육 개요" : "상세 내용"}</span>
              <span className="text-slate-400 font-normal">서식이 적용된 본문 에디터</span>
            </div>
            <RichEditor
              value={overview}
              onChange={setOverview}
              placeholder={
                formKey === "education"
                  ? "교육 목적, 내용, 기대 효과를 자유롭게 작성하세요..."
                  : "결재 사유와 상세 내용을 입력하세요..."
              }
              minHeight={280}
            />
          </div>

          {/* 배송지 */}
          <div className="border-t border-slate-200 px-5 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-semibold text-slate-600">배송지</span>
            </div>
            <input
              value={deliveryAddr}
              onChange={(e) => setDeliveryAddr(e.target.value)}
              placeholder="배송지 주소를 입력하세요"
              className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
            />
          </div>

          {/* 파일첨부 */}
          <div className="border-t border-slate-200 px-5 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-semibold text-slate-600">파일첨부</span>
                <span className="text-[10px] text-slate-400">({files.length})</span>
              </div>
              <label className="h-7 px-2.5 inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-700 cursor-pointer transition">
                <PaperclipIcon className="w-3 h-3" />
                파일 추가
                <input type="file" multiple onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            {files.length > 0 ? (
              <ul className="space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded text-[11px]">
                    <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="flex-1 truncate font-semibold text-slate-700">{f.name}</span>
                    <span className="text-slate-400">{(f.size / 1024).toFixed(1)}KB</span>
                    <button onClick={() => removeFile(i)} className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-[11px] text-slate-400 border border-dashed border-slate-200 rounded px-3 py-2 text-center">
                첨부된 파일이 없습니다
              </div>
            )}
          </div>

          {/* 관련문서 */}
          <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-semibold text-slate-600">관련문서</span>
            <button className="h-7 px-2.5 text-[11px] border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition">
              문서검색
            </button>
          </div>
        </div>

        {/* ─── 우측: 양식 선택 + 보존연한 + 액션 ─── */}
        <aside className="px-5 py-5 space-y-4 bg-slate-50/30">
          {/* 양식 선택 */}
          <div>
            <div className="text-[11px] font-semibold text-slate-600 mb-2">
              결재 양식 <span className="text-red-500">*</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setOpenFormPicker((v) => !v)}
                className={cn(
                  "w-full h-10 px-3 rounded-lg border bg-white text-left flex items-center gap-2 transition",
                  openFormPicker
                    ? "border-brand-500 ring-2 ring-brand-200"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <span className="text-xl">{currentForm.emoji}</span>
                <span className="flex-1 font-semibold text-slate-900 text-sm">{currentForm.label}</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition", openFormPicker && "rotate-180")} />
              </button>
              {openFormPicker && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-20">
                  {APPROVAL_FORMS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => {
                        setFormKey(f.key);
                        setOpenFormPicker(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition text-left",
                        formKey === f.key && "bg-brand-50",
                      )}
                    >
                      <span className="text-lg">{f.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-xs">{f.label}</div>
                        <div className="text-[10px] text-slate-500">{f.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 기안자 */}
          <div>
            <div className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <User className="w-3 h-3" /> 기안자
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 grid place-items-center text-xs font-bold">
                {draftAuthor.name[0]}
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-xs">{draftAuthor.name}</div>
                <div className="text-[10px] text-slate-500">{POSITION_LABELS[draftAuthor.position]}</div>
              </div>
            </div>
          </div>

          {/* 결재선 */}
          <div>
            <div className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <Users className="w-3 h-3" /> 결재선
            </div>
            <ol className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5">
              {APPROVAL_LINE.map((s) => (
                <li key={s.step} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold shrink-0",
                      s.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : s.status === "current"
                          ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300"
                          : "bg-slate-200 text-slate-500",
                    )}
                  >
                    {s.status === "approved" ? "✓" : s.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-[11px]">{s.name}</div>
                    <div className="text-[10px] text-slate-500">{s.position}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* 보존연한 */}
          <div>
            <div className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3" /> 보존연한
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 3, 5, 10].map((y) => (
                <button
                  key={y}
                  onClick={() => setPreserveYears(y)}
                  className={cn(
                    "h-8 rounded-md text-xs font-semibold transition",
                    preserveYears === y
                      ? "bg-brand-50 text-brand-700 ring-2 ring-brand-300"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {y}년
                </button>
              ))}
            </div>
          </div>

          {/* 알림 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[10px] text-amber-800 leading-relaxed">
              상신 후에는 수정이 제한됩니다. 작성 완료 후 <b>상신</b> 버튼을 눌러주세요.
            </div>
          </div>

          {/* 액션 */}
          <div className="space-y-1.5">
            <button
              onClick={() => setShowPreview(true)}
              disabled={!title}
              className="w-full h-9 inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Eye className="w-3.5 h-3.5" />
              미리보기
            </button>
            <button
              disabled={!title}
              className="w-full h-9 inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              임시저장
            </button>
            <button
              disabled={!title}
              className="w-full h-10 inline-flex items-center justify-center gap-1.5 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              결재 상신
            </button>
          </div>
        </aside>
      </div>

      {/* 미리보기 모달 */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 m-0">미리보기</h3>
              <button onClick={() => setShowPreview(false)} className="p-1 rounded hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-slate-200">
                <div className="text-lg font-bold text-slate-900">{currentForm.label}</div>
                <div className="text-xl font-bold text-slate-900 mt-3">{title || "(제목 없음)"}</div>
              </div>
              {overview && (
                <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: overview }} />
              )}
              {files.length > 0 && (
                <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <div className="font-semibold mb-1">첨부파일 ({files.length})</div>
                  {files.map((f, i) => (
                    <div key={i}>· {f.name}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub ───────────────────────────────────────────────────
function FormRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th className="w-[110px] px-4 py-2.5 text-[11px] font-semibold text-slate-600 bg-slate-50/60 border-b border-r border-slate-100 text-left">
        {label}
      </th>
      <td className="px-4 py-2.5 text-[13px] text-slate-900 border-b border-slate-100">{value}</td>
    </tr>
  );
}

function FormInputRow({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <tr>
      <th className="w-[110px] px-4 py-2 text-[11px] font-semibold text-slate-600 bg-slate-50/60 border-b border-r border-slate-100 text-left align-middle">
        {label}
      </th>
      <td className="px-3 py-1.5 border-b border-slate-100">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 px-2.5 text-[13px] bg-transparent outline-none rounded-md hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-200 transition"
        />
      </td>
    </tr>
  );
}

function FormTwoColRow({
  left,
  right,
}: {
  left: { label: string; value: string; onChange: (v: string) => void; type?: string };
  right: { label: string; value: string; onChange: (v: string) => void; type?: string };
}) {
  return (
    <tr>
      <th className="w-[110px] px-4 py-2 text-[11px] font-semibold text-slate-600 bg-slate-50/60 border-b border-r border-slate-100 text-left">
        {left.label}
      </th>
      <td className="px-3 py-1.5 border-b border-slate-100">
        <input
          type={left.type ?? "text"}
          value={left.value}
          onChange={(e) => left.onChange(e.target.value)}
          className="w-full h-9 px-2.5 text-[13px] bg-transparent outline-none rounded-md hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-200 transition"
        />
      </td>
      <th className="w-[110px] px-4 py-2 text-[11px] font-semibold text-slate-600 bg-slate-50/60 border-b border-r border-slate-100 text-left">
        {right.label}
      </th>
      <td className="px-3 py-1.5 border-b border-slate-100">
        <input
          type={right.type ?? "text"}
          value={right.value}
          onChange={(e) => right.onChange(e.target.value)}
          className="w-full h-9 px-2.5 text-[13px] bg-transparent outline-none rounded-md hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-brand-200 transition"
        />
      </td>
    </tr>
  );
}