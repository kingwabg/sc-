/**
 * 결재 요청 서비스 — 비즈니스 로직 + 인덱스 연동
 *
 * 결재 요청 생성/승인/반려/회수 시:
 *  1. 결재함(localStorage) 업데이트
 *  2. 통합 문서 인덱스(DocumentService)에도 동기화
 */
import { approvalRequestStorage } from "./storage";
import { documentService } from "@/lib/documents/service";
import type {
  ApprovalRequest,
  ApprovalStep,
  ApprovalFormKey,
  ApprovalLineInput,
} from "./types";

const CURRENT_AUTHOR = { id: "u_current", name: "나" };

/** 결재선 단계의 status를 새로 계산 (1단계는 current, 나머지는 pending) */
function buildLineWithStatus(rawLine: ApprovalLineInput[]): ApprovalStep[] {
  return rawLine.map((s, i) => ({
    step: i + 1,
    name: s.name,
    position: s.position,
    status: i === 0 ? "current" : "pending",
  }));
}

/** 문서번호 생성 (mock: 양식 약자-연도-일련번호) */
function makeDocNo(form: ApprovalFormKey): string {
  const prefix: Record<ApprovalFormKey, string> = {
    education: "EDU",
    leave: "LVE",
    expense: "EXP",
    purchase: "PUR",
    report: "RPT",
    memo: "MEM",
  };
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix[form]}-${year}-${seq}`;
}

// ─── 생성 ──────────────────────────────────────────────
type CreateInput = {
  documentId: string;
  documentUrl: string;
  documentKind: ApprovalRequest["documentKind"];
  title: string;
  form: ApprovalFormKey;
  line: ApprovalLineInput[];
  snippet?: string;
  urgent?: boolean;
  hasFile?: boolean;
  requesterName?: string;
};

function createRequest(input: CreateInput): ApprovalRequest {
  const line = buildLineWithStatus(input.line);
  const req = approvalRequestStorage.create({
    documentId: input.documentId,
    documentUrl: input.documentUrl,
    documentKind: input.documentKind,
    title: input.title,
    form: input.form,
    line,
    urgent: input.urgent ?? false,
    hasFile: input.hasFile ?? false,
    docNo: makeDocNo(input.form),
    snippet: input.snippet,
    requesterId: CURRENT_AUTHOR.id,
    requesterName: input.requesterName ?? CURRENT_AUTHOR.name,
  });
  // 통합 인덱스에도 등록
  documentService.upsert({
    id: `approval-${req.id}`,
    kind: "approval-doc",
    title: req.title,
    snippet: req.snippet,
    sourceUrl: `/approval/doc/${req.id}`,
    authorId: req.requesterId,
    authorName: req.requesterName,
    createdAt: req.createdAt,
    meta: { form: req.form, docNo: req.docNo, status: req.status },
  });
  return req;
}

// ─── 승인 ──────────────────────────────────────────────
function approveStep(reqId: string, step: number, comment?: string): ApprovalRequest | null {
  const req = approvalRequestStorage.get(reqId);
  if (!req) return null;
  if (req.status !== "결재중") return req;

  const now = Date.now();
  const newLine = req.line.map((s) => {
    if (s.step === step) {
      return { ...s, status: "approved" as const, actedAt: now, comment };
    }
    if (s.step === step + 1) {
      return { ...s, status: "current" as const };
    }
    return s;
  });

  // 다음 단계가 없으면 완료
  const hasNext = newLine.some((s) => s.step === step + 1);
  const nextStatus = hasNext ? "결재중" : "완료";

  const updated = approvalRequestStorage.update(reqId, {
    line: newLine,
    status: nextStatus,
    completedAt: hasNext ? undefined : now,
  });

  // 인덱스 메타 업데이트
  if (updated) {
    documentService.upsert({
      id: `approval-${updated.id}`,
      kind: "approval-doc",
      title: updated.title,
      snippet: updated.snippet,
      sourceUrl: `/approval/doc/${updated.id}`,
      authorId: updated.requesterId,
      authorName: updated.requesterName,
      createdAt: updated.createdAt,
      meta: { form: updated.form, docNo: updated.docNo, status: updated.status },
    });
  }
  return updated;
}

// ─── 반려 ──────────────────────────────────────────────
function rejectStep(reqId: string, step: number, comment?: string): ApprovalRequest | null {
  const req = approvalRequestStorage.get(reqId);
  if (!req) return null;
  if (req.status !== "결재중") return req;

  const now = Date.now();
  const newLine = req.line.map((s) =>
    s.step === step ? { ...s, status: "rejected" as const, actedAt: now, comment } : s,
  );

  const updated = approvalRequestStorage.update(reqId, {
    line: newLine,
    status: "반려",
    completedAt: now,
  });

  if (updated) {
    documentService.upsert({
      id: `approval-${updated.id}`,
      kind: "approval-doc",
      title: updated.title,
      snippet: updated.snippet,
      sourceUrl: `/approval/doc/${updated.id}`,
      authorId: updated.requesterId,
      authorName: updated.requesterName,
      createdAt: updated.createdAt,
      meta: { form: updated.form, docNo: updated.docNo, status: updated.status },
    });
  }
  return updated;
}

// ─── 회수 (요청자만) ───────────────────────────────────
function cancelRequest(reqId: string): ApprovalRequest | null {
  const req = approvalRequestStorage.get(reqId);
  if (!req) return null;
  if (req.status !== "결재중") return req;
  if (req.requesterId !== CURRENT_AUTHOR.id) return req;

  const now = Date.now();
  const updated = approvalRequestStorage.update(reqId, {
    status: "회수",
    completedAt: now,
  });

  if (updated) {
    documentService.upsert({
      id: `approval-${updated.id}`,
      kind: "approval-doc",
      title: updated.title,
      snippet: updated.snippet,
      sourceUrl: `/approval/doc/${updated.id}`,
      authorId: updated.requesterId,
      authorName: updated.requesterName,
      createdAt: updated.createdAt,
      meta: { form: updated.form, docNo: updated.docNo, status: updated.status },
    });
  }
  return updated;
}

function list() {
  return approvalRequestStorage.list();
}

function get(id: string) {
  return approvalRequestStorage.get(id);
}

export const approvalService = {
  createRequest,
  approveStep,
  rejectStep,
  cancelRequest,
  list,
  get,
};
