/**
 * app/api/approval/[id]/act/route.ts
 *
 * POST — 결재 승인/반려/확인/회수 액션
 *
 * Body: { action: "approve" | "reject" | "cc_confirm" | "withdraw", comment?: string }
 *
 * Flow:
 *  1. in-memory store에서 approval request 찾기 (mock — Prisma 연동 전 fallback)
 *  2. 현재 user의 step 찾기
 *  3. step status 업데이트
 *  4. 전체 status 결정 (all approved → 완료 / reject → 반려 / withdraw → 회수)
 */
import { NextRequest, NextResponse } from "next/server";
import type { ApprovalRequest, ApprovalStep } from "@/lib/features/approval/types";

// ─── In-memory mock store ─────────────────────────────────
// Prisma 연동 전까지 서버 메모리에ApprovalRequest 저장
// Serverless 환경에서는 매 요청마다 초기화되므로 짧은 TTL 용도로만 사용

interface MockApprovalRequest extends Omit<ApprovalRequest, "line"> {
  line: ApprovalStep[];
}

const mockStore = new Map<string, MockApprovalRequest>();

function initMockStore() {
  if (mockStore.size > 0) return;
  const now = Date.now();
  const day = 86_400_000;

  const seed: MockApprovalRequest[] = [
    {
      id: "s1", documentId: "doc-s1", documentUrl: "/docs/s1", documentKind: "other",
      title: "7월 연차 휴가 신청 (3일)", form: "leave",
      requesterId: "u1", requesterName: "홍길동",
      urgent: true, hasFile: false, docNo: "2024-휴가-00001",
      status: "결재중", createdAt: now - 1 * day,
      line: [
        { step: 1, name: "박은수", position: "지원교사", status: "approved", actedAt: now - 0.5 * day },
        { step: 2, name: "김선영", position: "지원교사", status: "current" },
        { step: 3, name: "김영미", position: "所长", status: "pending" },
      ],
    },
    {
      id: "s2", documentId: "doc-s2", documentUrl: "/docs/s2", documentKind: "other",
      title: "고객사 미팅 식대 지출", form: "expense",
      requesterId: "u1", requesterName: "홍길동",
      urgent: false, hasFile: false, docNo: "2024-지출-00002",
      status: "결재중", createdAt: now - 0.5 * day,
      line: [
        { step: 1, name: "김영미", position: "所长", status: "approved", actedAt: now - 0.3 * day },
        { step: 2, name: "이정호", position: "지원교사", status: "current" },
        { step: 3, name: "박은수", position: "지원교사", status: "pending" },
      ],
    },
    {
      id: "i1", documentId: "doc-i1", documentUrl: "/docs/i1", documentKind: "other",
      title: "사무용품 구매 품의 (필요 3종)", form: "purchase",
      requesterId: "u2", requesterName: "김철수",
      urgent: false, hasFile: false, docNo: "2024-구매-00004",
      status: "결재중", createdAt: now - 2 * day,
      line: [
        { step: 1, name: "이정호", position: "지원교사", status: "approved", actedAt: now - 1.5 * day },
        { step: 2, name: "김선영", position: "지원교사", status: "current" },
      ],
    },
  ];

  for (const req of seed) {
    mockStore.set(req.id, req);
  }
}

// ─── Current user (mock) ────────────────────────────────────
const CURRENT_USER = { id: "u1", name: "홍길동" };

// ─── Action Logic ─────────────────────────────────────────
type Action = "approve" | "reject" | "cc_confirm" | "withdraw";

function applyAction(
  req: MockApprovalRequest,
  action: Action,
  comment?: string,
): MockApprovalRequest {
  const now = Date.now();

  if (action === "withdraw") {
    // 요청자만 가능
    if (req.requesterId !== CURRENT_USER.id) {
      throw new Error("회수는 요청자만 가능합니다.");
    }
    return { ...req, status: "회수", completedAt: now };
  }

  if (action === "cc_confirm") {
    // 결재선에 현재 사용자가 있으면 cc_confirm (참조 확인)
    return req; // cc_confirm은 특별한 상태 변경 없음
  }

  // approve / reject — 현재 사용자의 current step 찾기
  const currentStep = req.line.find((s) => s.status === "current");
  if (!currentStep) {
    throw new Error("현재 결재 대기 단계가 없습니다.");
  }

  const newLine = req.line.map((s) => {
    if (s.step === currentStep.step) {
      return {
        ...s,
        status: action === "approve" ? "approved" as const : "rejected" as const,
        actedAt: now,
        comment,
      };
    }
    if (s.step === currentStep.step + 1 && action === "approve") {
      return { ...s, status: "current" as const };
    }
    return s;
  });

  let newStatus: MockApprovalRequest["status"] = "결재중";

  if (action === "reject") {
    newStatus = "반려";
  } else if (action === "approve") {
    const hasNext = newLine.some((s) => s.status === "current");
    newStatus = hasNext ? "결재중" : "완료";
  }

  return {
    ...req,
    line: newLine,
    status: newStatus,
    completedAt: newStatus !== "결재중" ? now : undefined,
  };
}

// ─── Route Handler ─────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ folder: string }> },
) {
  initMockStore();

  let body: { action: Action; comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { action } = body;
  if (!["approve", "reject", "cc_confirm", "withdraw"].includes(action)) {
    return NextResponse.json({ error: "유효하지 않은 action입니다." }, { status: 400 });
  }

  const { folder: id } = await params;
  const existing = mockStore.get(id);

  if (!existing) {
    return NextResponse.json({ error: "결재 문서를 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const updated = applyAction(existing, action, body.comment);
    mockStore.set(id, updated);
    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET — 결재 단건 조회 (act page용)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ folder: string }>,
}) {
  initMockStore();
  const { folder: id } = await params;
  const req = mockStore.get(id);
  if (!req) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, data: req });
}
