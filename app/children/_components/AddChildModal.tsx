"use client";

import { useState, useEffect } from "react";
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

function ageFromBirthDate(birthDate: string): number {
  if (!birthDate) return 0;
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export function AddChildModal({ capacityGroup, onClose, onSubmit }: Props) {
  // ── 기본 정보 ─────────────────────────────────────────────
  const [nameLast, setNameLast] = useState("");
  const [nameFirst, setNameFirst] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [grade, setGrade] = useState("초1");
  const [school, setSchool] = useState("");

  // ── 입소 / 퇴소 ──────────────────────────────────────────
  const [previousEnrolledAt, setPreviousEnrolledAt] = useState("");
  const [leftAt, setLeftAt] = useState("");

  // ── 주소 / 이용 ──────────────────────────────────────────
  const [address, setAddress] = useState("");
  const [serviceType, setServiceType] = useState("일반");
  const [medianIncomePct, setMedianIncomePct] = useState("");

  // ── 보호자 ───────────────────────────────────────────────
  const [guardianName, setGuardianName] = useState("");
  const [relation, setRelation] = useState<"부" | "모" | "조부모" | "기타">("모");
  const [guardianType, setGuardianType] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianNotes, setGuardianNotes] = useState("");

  // ── 담당자 ───────────────────────────────────────────────
  const [kidsCallId, setKidsCallId] = useState("");

  // ── 건강 ─────────────────────────────────────────────────
  const [allergiesText, setAllergiesText] = useState("");
  const [notes, setNotes] = useState("");

  // ── 연령 자동 계산 ─────────────────────────────────────
  const [age, setAge] = useState(0);
  useEffect(() => {
    setAge(ageFromBirthDate(birthDate));
  }, [birthDate]);

  const fullName = `${nameLast}${nameFirst}`;
  const isValid =
    nameLast.trim().length > 0 &&
    nameFirst.trim().length > 0 &&
    birthDate.length > 0 &&
    guardianName.trim().length > 0 &&
    guardianPhone.trim().length > 0;

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      name: fullName.trim(),
      nameLast: nameLast.trim(),
      nameFirst: nameFirst.trim(),
      gender,
      phone: phone.trim() || undefined,
      birthDate,
      grade,
      school: school.trim() || undefined,
      capacityGroup,
      guardian: {
        name: guardianName.trim(),
        relation,
        type: guardianType.trim() || undefined,
        phone: guardianPhone.trim(),
        notes: guardianNotes.trim() || undefined,
      },
      health: {
        allergies: allergiesText.split(",").map((s) => s.trim()).filter(Boolean),
        medications: [],
        notes: notes.trim(),
      },
      previousEnrolledAt: previousEnrolledAt || undefined,
      leftAt: leftAt || undefined,
      address: address.trim() || undefined,
      serviceType: serviceType.trim() || undefined,
      medianIncomePct: medianIncomePct ? Number(medianIncomePct) : undefined,
      kidsCallId: kidsCallId.trim() || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
            type="button"
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* 기본 정보 */}
          <Section title="기본 정보">
            <Grid>
              <Field label="성" required>
                <input
                  value={nameLast}
                  onChange={(e) => setNameLast(e.target.value)}
                  placeholder="김"
                  maxLength={4}
                  className={cn(inputCls, "font-bold")}
                />
              </Field>
              <Field label="이름" required>
                <input
                  value={nameFirst}
                  onChange={(e) => setNameFirst(e.target.value)}
                  placeholder="민준"
                  maxLength={10}
                  className={inputCls}
                />
              </Field>
            </Grid>

            {fullName.length > 0 && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-brand-50 border border-brand-200 rounded-[10px] text-[12px]">
                <span className="text-slate-500">미리보기</span>
                <span className="font-bold text-brand-700 text-[13px] tabular-nums">{fullName}</span>
              </div>
            )}

            <div className="mt-3">
              <Field label="성별">
                <div className="flex gap-2">
                  {(["M", "F"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
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
            </div>

            <Grid>
              <Field label="휴대폰" hint="아동 본인 (없으면 비워두세요)">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className={inputCls}
                />
              </Field>
              <Field label="생년월일" required>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </Grid>

            <Grid>
              <Field label="학년">
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className={inputCls}
                >
                  {["미취학", "초1", "초2", "초3", "초4", "초5", "초6", "중1", "중2", "중3", "고1", "고2", "고3"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </Field>
              <Field label="학교">
                <input
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="OO초등학교"
                  className={inputCls}
                />
              </Field>
            </Grid>
          </Section>

          {/* 입소 / 퇴소 */}
          <Section title="입소 / 퇴소">
            <Grid>
              <Field label="입소일" hint="오늘 날짜가 자동 입력됩니다">
                <input
                  type="date"
                  value={previousEnrolledAt}
                  onChange={(e) => setPreviousEnrolledAt(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="퇴소일" hint="재입소 시 이전 입소일">
                <input
                  type="date"
                  value={leftAt}
                  onChange={(e) => setLeftAt(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </Grid>
          </Section>

          {/* 주소 / 이용 */}
          <Section title="주소 / 이용">
            <Field label="주소">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="서울특별시 OO구 OO동 123-45"
                className={inputCls}
              />
            </Field>
            <Grid>
              <Field label="이용유형">
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className={inputCls}
                >
                  {["일반", "긴급", "맞춤", "기타"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="함수기준 중위소득 (%)">
                <input
                  type="number"
                  value={medianIncomePct}
                  onChange={(e) => setMedianIncomePct(e.target.value)}
                  placeholder="0~150"
                  min={0}
                  max={200}
                  className={inputCls}
                />
              </Field>
            </Grid>
          </Section>

          {/* 보호자 */}
          <Section title="보호자">
            <Grid>
              <Field label="성명" required>
                <input
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="홍길순"
                  className={inputCls}
                />
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
            </Grid>
            <Grid>
              <Field label="유형" hint="예: 양육, 친권, 후견">
                <input
                  value={guardianType}
                  onChange={(e) => setGuardianType(e.target.value)}
                  placeholder="양육"
                  className={inputCls}
                />
              </Field>
              <Field label="비고">
                <input
                  value={guardianNotes}
                  onChange={(e) => setGuardianNotes(e.target.value)}
                  placeholder=""
                  className={inputCls}
                />
              </Field>
            </Grid>
            <Field label="연락처" required>
              <input
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="010-0000-0000"
                className={inputCls}
              />
            </Field>
          </Section>

          {/* 담당자 */}
          <Section title="담당자">
            <Field label="키즈콜ID" hint="담당자키즈콜 시스템 ID">
              <input
                value={kidsCallId}
                onChange={(e) => setKidsCallId(e.target.value)}
                placeholder="staff_xxx"
                className={inputCls}
              />
            </Field>
          </Section>

          {/* 건강 */}
          <Section title="건강 정보">
            <Field label="알레르기" hint="쉼표로 구분 (예: 복숭아, 땅콩)">
              <input
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="복숭아, 우유"
                className={inputCls}
              />
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
            type="button"
            onClick={onClose}
            className="h-9 px-4 bg-white border border-slate-200 text-slate-700 text-[13px] font-medium rounded-[10px] hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
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

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
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