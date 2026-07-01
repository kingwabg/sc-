import type { ChildDocument } from "./types";
import { readLS, writeLS } from "@/lib/store/_ls";
import { documentService } from "@/lib/documents/service";
import { getAllDocumentsByChild } from "./utils";

const STORAGE_KEY = "ox:child-documents-text-docs:v1";

export function saveTextDoc(doc: ChildDocument): void {
  if (typeof window === "undefined") return;
  const list: ChildDocument[] = readLS<ChildDocument[]>(STORAGE_KEY, []);
  const filtered = list.filter((d) => d.id !== doc.id);
  filtered.unshift(doc);
  writeLS(STORAGE_KEY, filtered.slice(0, 50));
  // write-through: 문서 인덱스에도 등록
  documentService.upsert({
    id: doc.id,
    kind: "child-document",
    title: doc.title,
    snippet: doc.excerpt ?? doc.content?.slice(0, 140),
    sourceUrl: `/children/${doc.childId}/documents`,
    childId: doc.childId,
    authorId: doc.uploadedBy,
    authorName: doc.uploadedBy,
    createdAt: doc.createdAt,
    meta: { category: doc.category, kind: doc.kind, fileType: doc.fileType },
  });
}

export function getStoredTextDocs(childId: string): ChildDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const list: ChildDocument[] = readLS<ChildDocument[]>(STORAGE_KEY, []);
    return list.filter((d) => d.childId === childId);
  } catch {
    return [];
  }
}

export function getAllDocumentsForChild(childId: string): ChildDocument[] {
  return [...getAllDocumentsByChild(childId), ...getStoredTextDocs(childId)];
}
