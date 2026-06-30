/**
 * DocumentIndexStorage — 통합 문서 인덱스 저장소
 *
 * localStorage 기반. 미래에 DB로 이전 시 이 파일만 갈아끼우면 됨.
 */
import type { DocumentIndexEntry, DocumentKind } from "./types";

const KEY = "office-portal:doc-index:v1";

function readAll(): DocumentIndexEntry[] {
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

function writeAll(entries: DocumentIndexEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn("[docIndex] writeAll failed:", e);
  }
}

export const docIndexStorage = {
  list(): DocumentIndexEntry[] {
    return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
  },

  upsert(entry: DocumentIndexEntry): void {
    const all = readAll();
    const idx = all.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      all[idx] = entry;
    } else {
      all.unshift(entry);
    }
    writeAll(all);
  },

  remove(id: string): void {
    writeAll(readAll().filter((e) => e.id !== id));
  },

  removeBySource(sourceUrl: string): void {
    writeAll(readAll().filter((e) => e.sourceUrl !== sourceUrl));
  },

  findById(id: string): DocumentIndexEntry | undefined {
    return readAll().find((e) => e.id === id);
  },

  findBySource(sourceUrl: string): DocumentIndexEntry | undefined {
    return readAll().find((e) => e.sourceUrl === sourceUrl);
  },

  listByKind(kind: DocumentKind): DocumentIndexEntry[] {
    return readAll()
      .filter((e) => e.kind === kind)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },

  listByChildId(childId: string): DocumentIndexEntry[] {
    return readAll()
      .filter((e) => e.childId === childId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },

  /** 디버그/테스트용 — 전체 삭제 */
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEY);
  },
};
