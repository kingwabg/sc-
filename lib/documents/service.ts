/**
 * DocumentService — 통합 문서 인덱스 퍼사드
 *
 * 모든 write 사이트가 이 서비스를 통해 인덱스를 업데이트.
 * - upsert: 원본 저장 후 호출 → 인덱스 1행 upsert
 * - remove: 원본 삭제 후 호출 → 인덱스에서 제거
 * - list: 필터링/정렬된 통합 목록
 */
import { docIndexStorage } from "./index-storage";
import type {
  DocumentIndexEntry,
  DocumentKind,
  DocumentIndexFilter,
} from "./types";

type UpsertInput = {
  id: string;
  kind: DocumentKind;
  title: string;
  snippet?: string;
  sourceUrl: string;
  childId?: string;
  authorId: string;
  authorName: string;
  /** epoch ms — 기존 createdAt 보존용 */
  createdAt?: number;
  meta?: DocumentIndexEntry["meta"];
};

/** 모든 문서 작성/수정 시 인덱스 갱신 (write-through) */
function upsert(input: UpsertInput): DocumentIndexEntry {
  const now = Date.now();
  const existing = docIndexStorage.findBySource(input.sourceUrl);
  const entry: DocumentIndexEntry = {
    id: input.id,
    kind: input.kind,
    title: input.title,
    snippet: input.snippet,
    sourceUrl: input.sourceUrl,
    childId: input.childId,
    authorId: input.authorId,
    authorName: input.authorName,
    createdAt: existing?.createdAt ?? input.createdAt ?? now,
    updatedAt: now,
    meta: input.meta,
  };
  docIndexStorage.upsert(entry);
  return entry;
}

/** 원본 삭제 시 인덱스에서도 제거 */
function removeBySource(sourceUrl: string): void {
  docIndexStorage.removeBySource(sourceUrl);
}

function remove(id: string): void {
  docIndexStorage.remove(id);
}

function list(filter?: DocumentIndexFilter): DocumentIndexEntry[] {
  let entries = docIndexStorage.list();
  if (!filter) return entries;

  if (filter.kind && filter.kind !== "all") {
    entries = entries.filter((e) => e.kind === filter.kind);
  }
  if (filter.childId) {
    entries = entries.filter((e) => e.childId === filter.childId);
  }
  if (filter.authorId) {
    entries = entries.filter((e) => e.authorId === filter.authorId);
  }
  if (filter.query) {
    const q = filter.query.toLowerCase();
    entries = entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.snippet?.toLowerCase().includes(q) ?? false),
    );
  }
  if (filter.from != null) {
    entries = entries.filter((e) => e.updatedAt >= filter.from!);
  }
  if (filter.to != null) {
    entries = entries.filter((e) => e.updatedAt <= filter.to!);
  }
  return entries;
}

function listByChild(childId: string): DocumentIndexEntry[] {
  return docIndexStorage.listByChildId(childId);
}

/** 디버그/테스트용 */
function clear(): void {
  docIndexStorage.clear();
}

export const documentService = {
  upsert,
  removeBySource,
  remove,
  list,
  listByChild,
  clear,
};
