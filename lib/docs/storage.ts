import type { Doc, DocStorage, DocSummary } from "./types";
import { documentService } from "@/lib/documents/service";

const KEY = "office-portal:docs:v1";
const CURRENT_AUTHOR = { id: "u_current", name: "나" };

/** HTML → plain text 변환 (목록 snippet / 글자수용) */
function stripHtml(html: string): string {
  if (typeof document === "undefined") {
    // SSR 안전
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): Doc[] {
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

function writeAll(docs: Doc[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(docs));
}

export class LocalDocStorage implements DocStorage {
  async list(): Promise<DocSummary[]> {
    const docs = readAll();
    return docs
      .map((d) => {
        const text = stripHtml(d.content);
        return {
          id: d.id,
          title: d.title,
          snippet: text.slice(0, 140),
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          wordCount: text.length,
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<Doc | null> {
    const docs = readAll();
    return docs.find((d) => d.id === id) ?? null;
  }

  async create(): Promise<Doc> {
    const now = Date.now();
    const doc: Doc = {
      id: newId(),
      title: "제목 없는 문서",
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    writeAll([doc, ...readAll()]);
    // write-through: 문서 인덱스에도 등록
    documentService.upsert({
      id: doc.id,
      kind: "html-doc",
      title: doc.title,
      snippet: "",
      sourceUrl: `/docs/${doc.id}`,
      authorId: CURRENT_AUTHOR.id,
      authorName: CURRENT_AUTHOR.name,
      createdAt: doc.createdAt,
    });
    return doc;
  }

  async save(input: Pick<Doc, "id" | "title" | "content">): Promise<Doc> {
    const all = readAll();
    const idx = all.findIndex((d) => d.id === input.id);
    const now = Date.now();
    let saved: Doc;
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        title: input.title,
        content: input.content,
        updatedAt: now,
      };
      saved = all[idx];
    } else {
      const doc: Doc = {
        id: input.id,
        title: input.title,
        content: input.content,
        createdAt: now,
        updatedAt: now,
      };
      all.unshift(doc);
      saved = doc;
    }
    writeAll(all);
    // write-through: 인덱스 메타 업데이트
    documentService.upsert({
      id: saved.id,
      kind: "html-doc",
      title: saved.title,
      snippet: stripHtml(saved.content).slice(0, 140),
      sourceUrl: `/docs/${saved.id}`,
      authorId: CURRENT_AUTHOR.id,
      authorName: CURRENT_AUTHOR.name,
      createdAt: saved.createdAt,
    });
    return saved;
  }

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter((d) => d.id !== id));
    // write-through: 인덱스에서도 제거
    documentService.removeBySource(`/docs/${id}`);
  }
}

export const docStorage: DocStorage = new LocalDocStorage();
