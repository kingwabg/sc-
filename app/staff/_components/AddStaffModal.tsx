"use client";

/** 종사자 등록/수정 모달 — initial이 있으면 수정, 없으면 추가 */
import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  ButtonGroup,
  Form,
} from "rsuite";
import { cn } from "@/lib/utils";
import { POSITION_LABELS, type Staff, type StaffPosition } from "@/lib/staff";

type Props = {
  initial?: Staff | null;
  onClose: () => void;
  onSubmit: (s: Staff) => void;
};

export function StaffFormModal({ initial, onClose, onSubmit }: Props) {
  const isEdit = !!initial;
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [gender, setGender] = useState<"M" | "F">("F");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState<StaffPosition>("支援교사");
  const [joinDate, setJoinDate] = useState(new Date().toISOString().slice(0, 10));
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Staff["status"]>("active");

  // initial이 바뀌면 폼 다시 채우기 (수정 모드로 열 때)
  useEffect(() => {
    if (!initial) return;
    setName(initial.name);
    setLoginId(initial.loginId);
    setGender(initial.gender);
    setPhone(initial.phone);
    setPosition(initial.position);
    setJoinDate(initial.joinDate);
    setEmail(initial.email ?? "");
    setStatus(initial.status);
  }, [initial]);

  const positions = Object.keys(POSITION_LABELS) as StaffPosition[];
  const isValid = name.trim().length > 0 && phone.trim().length > 0;

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      id: initial?.id ?? `s-new-${Date.now()}`,
      tenantId: "t_acme",
      name: name.trim(),
      loginId: loginId.trim() || name.trim().toLowerCase(),
      gender,
      phone: phone.trim(),
      position,
      joinDate,
      email: email.trim() || undefined,
      status,
    });
  }

  return (
    <Modal open onClose={onClose} size="md" backdrop="static">
      <Modal.Header closeButton={false}>
        <Modal.Title>{isEdit ? "종사자 수정" : "종사자 등록"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form fluid>
          <div className="grid grid-cols-2 gap-3">
            <Field label="이름" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="김영미"
                className={inputCls}
              />
            </Field>
            <Field label="직위" required>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as StaffPosition)}
                className={inputCls}
              >
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {POSITION_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="성별">
              <ButtonGroup size="sm" className="w-full">
                {(["F", "M"] as const).map((g) => (
                  <Button
                    key={g}
                    active={gender === g}
                    onClick={() => setGender(g)}
                    style={{ flex: 1 }}
                  >
                    {g === "F" ? "여" : "남"}
                  </Button>
                ))}
              </ButtonGroup>
            </Field>
            <Field label="연락처" required>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className={inputCls}
              />
            </Field>
            <Field label="입사일">
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="로그인 ID">
              <input
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="자동 생성"
                className={inputCls}
              />
            </Field>
            <Field label="이메일" className="col-span-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="선택"
                className={inputCls}
              />
            </Field>
            {isEdit && (
              <Field label="상태" className="col-span-2">
                <ButtonGroup size="sm">
                  <Button active={status === "active"} onClick={() => setStatus("active")}>재직</Button>
                  <Button active={status === "leave"} onClick={() => setStatus("leave")}>휴직</Button>
                  <Button active={status === "retired"} onClick={() => setStatus("retired")}>퇴직</Button>
                </ButtonGroup>
              </Field>
            )}
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="subtle">취소</Button>
        <Button onClick={handleSubmit} disabled={!isValid} appearance="primary">
          {isEdit ? "저장" : "등록"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const inputCls =
  "rs-form-control w-full h-9 px-3 bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="rs-form-control-label block text-[12px] font-medium text-slate-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
