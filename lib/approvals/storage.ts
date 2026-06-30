/**
 * 결재 요청 저장소 (localStorage)
 */
import type { ApprovalRequest } from "./types";

const KEY = "officex:approval-requests:v1";

function readAll(): ApprovalRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(reqs: ApprovalRequest[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(reqs));
  } catch (e) {
    console.warn("[approvalRequests] writeAll failed:", e);
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `apr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const approvalRequestStorage = {
  list(): ApprovalRequest[] {
    return readAll().sort((a, b) => b.createdAt - a.createdAt);
  },

  get(id: string): ApprovalRequest | null {
    return readAll().find((r) => r.id === id) ?? null;
  },

  create(input: Omit<ApprovalRequest, "id" | "createdAt" | "status">): ApprovalRequest {
    const now = Date.now();
    const req: ApprovalRequest = {
      ...input,
      id: newId(),
      createdAt: now,
      status: "결재중",
    };
    writeAll([req, ...readAll()]);
    return req;
  },

  update(id: string, patch: Partial<ApprovalRequest>): ApprovalRequest | null {
    const all = readAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    all[idx] = { ...all[idx], ...patch };
    writeAll(all);
    return all[idx];
  },

  remove(id: string): void {
    writeAll(readAll().filter((r) => r.id !== id));
  },

  /** 디버그/테스트용 */
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEY);
  },
};
