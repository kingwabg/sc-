"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Child, CapacityGroup } from "@/lib/features/children/types";

const inputCls =
  "w-full h-9 px-3 bg-white border border-slate-200 rounded-[10px] text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

type Props = {
  capacityGroup: CapacityGroup;
  onClose: () => void;
  onSubmit: (child: Omit<Child, "id" | "tenantId" | "status" | "enrolledAt">) => void;
};

export function AddChildModal({ capacityGroup, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [birthDate, setBirthDate] = useState("");
  const [grade, setGrade] = useState("초1");
  const [guardianName, setGuardianName] = useState("");
  const [relation, setRelation] = useState<"부" | "모" | "조부모" | "기타">("모");
  const [phone, setPhone] = useState("");
  const [job, setJob] = useState("");
  const [allergiesText, setAllergiesText] = useState("");
  const [notes, setNotes] = useState("");

  const isValid =
    name.trim().length > 0 &&
    birthDate.length > 0 &&
    guardianName.trim().length > 0 &&
    phone.trim().length > 0;

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      name: name.trim(),
      gender,
      birthDate,
      grade,
      capacityGroup,
      guardian: {
        name: guardianName.trim(),
        relation,
        phone: phone.trim(),
        job: job.trim() || undefined,
      },
      health: {
        allergies: allergiesText.split(",").map((s) => s.trim()).filter(Boolean),
        medications: [],
        notes: notes.trim(),
      },
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 m-0">아동 등록</h2>
            <p className="text-[12px] text-slate-500 m-0 mt-0.5">
              시설 정원 {capacityGroup}명 그룹으로 자동 배정됩니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* 기본 정보 */}
          <Section title="기본 정보">
            <Grid>
              <Field label="이름" required>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className={inputCls} />
              </Field>
              <Field label="성별">
                <div className="flex gap-2">
                  {(["M", "F"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={cn(
                        "flex-1 h-9 rounded-[10px] text-[13px] font-semibold border transition",
                        gender === g
                          ? "bg-brand-50 border-brand-400 text-brand-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {g === "M" ? "남" : "여"}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="생년월일" required>
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputCls} />
              </Field>
              <Field label="학년">
                <select value={grade} onChange={(e) => setGrade(e.target.value)} className={inputCls}>
                  {["초1", "초2", "초3", "초4", "초5", "초6"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </Field>
            </Grid>
          </Section>

          {/* 보호자 */}
          <Section title="보호자">
            <Grid>
              <Field label="보호자명" required>
                <input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="홍길순" className={inputCls} />
              </Field>
              <Field label="관계">
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value as "부" | "모" | "조부모" | "기타")}
                  className={inputCls}
                >
                  {["모", "부", "조부모", "기타"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="연락처" required>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputCls} />
              </Field>
              <Field label="직업">
                <input value={job} onChange={(e) => setJob(e.target.value)} placeholder="회사원" className={inputCls} />
              </Field>
            </Grid>
          </Section>

          {/* 건강 */}
          <Section title="건강 정보">
            <Field label="알레르기" hint="쉼표로 구분 (예: 복숭아, 땅콩)">
              <input value={allergiesText} onChange={(e) => setAllergiesText(e.target.value)} placeholder="복숭아, 우유" className={inputCls} />
            </Field>
            <Field label="특이사항">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="주의사항, 복용 약, 행동 특성 등"
                className={cn(inputCls, "h-20 resize-none")}
              />
            </Field>
          </Section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 bg-white border border-slate-200 text-slate-700 text-[13px] font-medium rounded-[10px] hover:bg-slate-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={cn(
              "h-9 px-4 text-white text-[13px] font-semibold rounded-[10px] transition",
              isValid ? "bg-brand-600 hover:bg-brand-700" : "bg-slate-300 cursor-not-allowed",
            )}
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form Helpers ─────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[12px] font-bold text-slate-700 mb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-slate-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
