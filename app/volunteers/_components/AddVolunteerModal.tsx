"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { VOLUNTEER_TYPE_LABELS, type Volunteer, type VolunteerType } from "@/lib/volunteer";

const inputCls =
  "w-full h-9 px-3 bg-white border border-slate-200 rounded-[10px] text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

function Field({
  label,
  required,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[12px] font-medium text-slate-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

type Props = {
  onClose: () => void;
  onSubmit: (vol: Volunteer) => void;
};

export function AddVolunteerModal({ onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("F");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<VolunteerType>("자원봉사자");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [organization, setOrganization] = useState("");
  const [note, setNote] = useState("");

  const isValid = name.trim().length > 0 && phone.trim().length > 0;
  const types = Object.keys(VOLUNTEER_TYPE_LABELS) as VolunteerType[];

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      id: `v-new-${Date.now()}`,
      tenantId: "t_acme",
      name: name.trim(),
      gender,
      phone: phone.trim(),
      type,
      startDate,
      endDate: endDate || undefined,
      organization: organization.trim() || undefined,
      note: note.trim() || undefined,
      status: "active",
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
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 m-0">비종사자 등록</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="이름" required>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="정서윤" className={inputCls} />
            </Field>
            <Field label="유형" required>
              <select value={type} onChange={(e) => setType(e.target.value as VolunteerType)} className={inputCls}>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {VOLUNTEER_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="성별">
              <div className="flex gap-2">
                {(["F", "M"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      "flex-1 h-9 rounded-[10px] text-[13px] font-semibold border transition",
                      gender === g
                        ? "bg-brand-50 border-brand-400 text-brand-700"
                        : "bg-white border-slate-200 text-slate-600",
                    )}
                  >
                    {g === "F" ? "여" : "남"}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="연락처" required>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputCls} />
            </Field>
            <Field label="활동 시작일">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="활동 종료일" hint="비워두면 계속">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="소속" className="col-span-2">
              <input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="OO대학교, OO구청 등" className={inputCls} />
            </Field>
            <Field label="비고" className="col-span-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="특이사항"
                className={inputCls + " h-20 resize-none"}
              />
            </Field>
          </div>
        </div>
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
            등록
          </button>
        </div>
      </div>
    </div>
  );
}