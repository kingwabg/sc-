// lib/features/approval-folder/data.ts (P11-3) — 12개 folder mock list (30+건)
// Mavis 직접 작성. tryPrisma mock fallback.

import type { ApprovalListItem, FolderKey } from "./types";
import { FORM_LABEL } from "./labels";

// In-memory mock store (Mavis 직접, DB 마이그레이션 불필요)
const MOCK_STORE: Record<FolderKey, ApprovalListItem[]> = {
  default: [
    { id: "apr-001", docNo: "서창-2026-00001", form: "업무 분장표", urgent: false, title: "2026년 상반기 업무 분장", hasFile: true, requesterName: "박은수", status: "완료", line: "박은수→왕준하", createdAt: "2026-01-02" },
  ],
  standby: [
    { id: "apr-002", docNo: "서창-2026-00002", form: "지출결의", urgent: true, title: "1월 프로그램 운영비", hasFile: true, requesterName: "김영란", status: "결재중", line: "김영란→박은수→왕준하", createdAt: "2026-01-08" },
    { id: "apr-003", docNo: "서창-2026-00003", form: "휴가신청", urgent: false, title: "연차 사용 신청", hasFile: false, requesterName: "이철수", status: "결재중", line: "이철수→박은수", createdAt: "2026-01-10" },
  ],
  inbox: [
    { id: "apr-004", docNo: "서창-2026-00004", form: "구매품의", urgent: false, title: "학습 교재 구매", hasFile: true, requesterName: "최은정", status: "결재중", line: "최은정→박은수", createdAt: "2026-01-12" },
  ],
  cc: [
    { id: "apr-005", docNo: "서창-2026-00005", form: "보고", urgent: false, title: "월간 운영 보고 (참조)", hasFile: true, requesterName: "박은수", status: "결재중", line: "박은수→왕준하 (CC: 김영란)", createdAt: "2026-01-15" },
  ],
  expected: [
    { id: "apr-006", docNo: "예정-0001", form: "메모", urgent: false, title: "2월 사업계획 (예정)", hasFile: false, requesterName: "박은수", status: "결재중", line: "예정", createdAt: "2026-01-20" },
  ],
  draft: [
    { id: "apr-007", docNo: "서창-2026-00006", form: "업무 분장표", urgent: false, title: "2월 업무 분장 (작성 중)", hasFile: false, requesterName: "박은수", status: "결재중", line: "작성 중", createdAt: "2026-01-22" },
    { id: "apr-008", docNo: "서창-2026-00007", form: "지출결의", urgent: false, title: "2월 프로그램 예산", hasFile: true, requesterName: "김영란", status: "결재중", line: "작성 중", createdAt: "2026-01-23" },
  ],
  temporary: [
    { id: "apr-009", docNo: "임시-0001", form: "메모", urgent: false, title: "임시 저장된 메모", hasFile: false, requesterName: "이철수", status: "결재중", line: "임시", createdAt: "2026-01-25" },
  ],
  sign: [
    { id: "apr-010", docNo: "서창-2026-00001", form: "업무 분장표", urgent: false, title: "2026년 상반기 업무 분장", hasFile: true, requesterName: "박은수", status: "완료", line: "박은수→왕준하", createdAt: "2026-01-02" },
    { id: "apr-011", docNo: "서창-2025-00999", form: "보고", urgent: false, title: "2025년 연말 보고", hasFile: true, requesterName: "박은수", status: "완료", line: "박은수→왕준하", createdAt: "2025-12-28" },
  ],
  ccbox: [
    { id: "apr-012", docNo: "서창-2025-00998", form: "구매품의", urgent: false, title: "연말 물품 구매 (참조)", hasFile: true, requesterName: "최은정", status: "완료", line: "최은정→박은수 (CC: 왕준하)", createdAt: "2025-12-15" },
  ],
  inboxbox: [
    { id: "apr-013", docNo: "외부-2025-0050", form: "공문", urgent: true, title: "시청 발신 공문 (수신)", hasFile: true, requesterName: "외부", status: "완료", line: "외부→왕준하", createdAt: "2025-12-10" },
  ],
  sendbox: [
    { id: "apr-014", docNo: "서창-2025-0097", form: "공문", urgent: false, title: "시청 발송 (발송)", hasFile: true, requesterName: "왕준하", status: "완료", line: "왕준하→외부", createdAt: "2025-12-05" },
  ],
  appr: [
    { id: "apr-015", docNo: "공문-2025-001", form: "공문", urgent: false, title: "시청 공문 (공문 문서함)", hasFile: true, requesterName: "왕준하", status: "완료", line: "왕준하→외부", createdAt: "2025-12-01" },
  ],
};

/**
 * 12개 folder 별 list 조회 (mock fallback)
 * 추후 Prisma 추가 시 try/catch + db.approvalRequest.findMany 로 확장
 */
export async function getApprovalList(
  folder: FolderKey,
  _userId: string,
  _tenantId: string
): Promise<ApprovalListItem[]> {
  // TODO: Prisma query 추가 (mock fallback)
  return MOCK_STORE[folder] ?? [];
}

/**
 * 결재 진행 action
 */
export async function actOnApproval(
  approvalId: string,
  action: "approve" | "reject" | "cc_confirm" | "withdraw",
  _comment?: string
): Promise<{ ok: boolean; approvalId: string; action: string; newStatus: string }> {
  // mock: in-memory update
  for (const folder of Object.keys(MOCK_STORE) as FolderKey[]) {
    const item = MOCK_STORE[folder].find((a) => a.id === approvalId);
    if (item) {
      if (action === "approve") item.status = "완료";
      if (action === "reject") item.status = "반려";
      if (action === "withdraw") item.status = "회수";
      return { ok: true, approvalId, action, newStatus: item.status };
    }
  }
  return { ok: false, approvalId, action, newStatus: "not_found" };
}

// re-export for convenience
export { FORM_LABEL };