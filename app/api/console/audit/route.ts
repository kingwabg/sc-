/**
 * app/api/console/audit/route.ts
 *
 * GET /api/console/audit — 운영자 콘솔: 전체 운영자 활동 감사 로그
 *
 * Query params:
 *   ?action=CREATE|UPDATE|DELETE|VIEW|LOGIN
 *   ?user=홍길동
 *   ?from=2026-07-01&to=2026-07-03
 *   ?page=1&pageSize=10
 *
 * 응답: {
 *   ok: true,
 *   logs: AuditLog[],
 *   total: number,
 *   page: number,
 *   pageSize: number,
 *   totalPages: number,
 * }
 *
 * 데이터: 현재는 in-memory mock 30건 (DB 연동 전 fallback).
 *        추후 AuditLog 테이블 추가 시 prisma.auditLog.findMany() 로 교체.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "LOGIN";
export type AuditResult = "success" | "failure";

export interface AuditLog {
  id: string;
  timestamp: string; // ISO
  userId: string;
  userName: string;
  action: AuditAction;
  targetType: string; // e.g., "tenant", "staff", "billing"
  targetId?: string;
  targetName?: string;
  ip: string;
  userAgent?: string;
  result: AuditResult;
  note?: string;
}

const USERS = [
  { id: "u-001", name: "홍길동" },
  { id: "u-002", name: "김선영" },
  { id: "u-003", name: "박은수" },
  { id: "u-004", name: "이정호" },
  { id: "u-005", name: "최민아" },
];

const ACTIONS: AuditAction[] = ["CREATE", "UPDATE", "DELETE", "VIEW", "LOGIN"];
const TARGET_TYPES = ["tenant", "staff", "billing", "domain", "document", "settings"];
const RESULTS: AuditResult[] = ["success", "success", "success", "success", "failure"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

/** mock 30건 시드 — deterministic (page reload 시 같은 결과) */
function seedLogs(): AuditLog[] {
  const now = Date.now();
  const day = 86_400_000;
  const hour = 3_600_000;
  const out: AuditLog[] = [];

  for (let i = 0; i < 30; i++) {
    const action = pick(ACTIONS, i);
    const user = pick(USERS, i);
    const targetType = pick(TARGET_TYPES, i + (action === "LOGIN" ? 3 : 1));
    const result = pick(RESULTS, i);
    const offset = (i * 7) % (5 * day); // 5일 내 흩어진 시각
    const ts = new Date(now - offset - (i % 12) * hour).toISOString();
    out.push({
      id: `log-${(i + 1).toString().padStart(3, "0")}`,
      timestamp: ts,
      userId: user.id,
      userName: user.name,
      action,
      targetType,
      targetId: action === "LOGIN" ? undefined : `${targetType}-${(i % 5) + 1}`,
      targetName:
        action === "LOGIN"
          ? undefined
          : `${targetType}-${(i % 5) + 1} ${pick(["서창", "행당", "마포", "양산", "제주"], i)}센터`,
      ip: `192.168.1.${(i % 254) + 1}`,
      userAgent: "Mozilla/5.0 (Macintosh) Chrome/124.0",
      result,
      note:
        action === "LOGIN" && result === "failure"
          ? "비밀번호 5회 오류"
          : action === "DELETE"
            ? "관리자 권한으로 삭제"
            : undefined,
    });
  }
  // 최신순
  return out.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

const MOCK_LOGS: AuditLog[] = seedLogs();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const user = (url.searchParams.get("user") || "").trim();
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || "10")));

    let filtered = [...MOCK_LOGS];
    if (action && action !== "all" && ACTIONS.includes(action as AuditAction)) {
      filtered = filtered.filter((l) => l.action === action);
    }
    if (user) {
      const q = user.toLowerCase();
      filtered = filtered.filter((l) => l.userName.toLowerCase().includes(q));
    }
    if (from) {
      const fromTs = new Date(from).getTime();
      filtered = filtered.filter((l) => new Date(l.timestamp).getTime() >= fromTs);
    }
    if (to) {
      const toTs = new Date(`${to}T23:59:59`).getTime();
      filtered = filtered.filter((l) => new Date(l.timestamp).getTime() <= toTs);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const logs = filtered.slice(start, start + pageSize);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      ok: true,
      logs,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (err) {
    console.error("[api/console/audit GET]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
