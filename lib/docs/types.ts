export type Doc = {
  id: string;
  title: string;
  /** HTML 직렬화된 본문 */
  content: string;
  /** epoch ms */
  createdAt: number;
  updatedAt: number;
};

export type DocSummary = {
  id: string;
  title: string;
  /** 본문에서 plain text로 발췌한 snippet (목록 미리보기용) */
  snippet: string;
  createdAt: number;
  updatedAt: number;
  /** 본문 길이 (글자수, HTML 제외) */
  wordCount: number;
};

export type DocStorage = {
  list(): Promise<DocSummary[]>;
  get(id: string): Promise<Doc | null>;
  create(): Promise<Doc>;
  save(doc: Pick<Doc, "id" | "title" | "content">): Promise<Doc>;
  remove(id: string): Promise<void>;
};
