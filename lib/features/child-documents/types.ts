// Child Documents — 아동 개인 문서 (1:1)
// 신분증, 예방접종, 보호자 동의서, IEP, 사고 보고 등

export type ChildDocumentCategory =
  | "신분증"
  | "예방접종"
  | "건강검진"
  | "알레르기 진단"
  | "보호자 동의"
  | "개별교육계획(IEP)"
  | "사고 보고"
  | "발달평가"
  | "사진"
  | "아동상담"
  | "보호자 상담"
  | "관찰일지"
  | "기타";

/** 텍스트 기반 (에디터로 작성하는) 카테고리 — 파일 업로드 X */
export const TEXT_CATEGORIES: ChildDocumentCategory[] = ["아동상담", "보호자 상담", "관찰일지"];

export type ChildDocument = {
  id: string;
  childId: string;
  title: string;
  category: ChildDocumentCategory;
  /** file = 업로드한 파일, text = 에디터로 작성한 본문 */
  kind: "file" | "text";
  fileType?: "pdf" | "image" | "hwp" | "doc";
  fileSize?: number;
  /** 텍스트 문서 (kind === 'text')의 본문 HTML */
  content?: string;
  /** 텍스트 문서의 plain text 미리보기 */
  excerpt?: string;
  /** 발급/수집 일자 (파일) 또는 작성일 (텍스트) */
  issuedAt: string;
  /** 만료일 (있는 경우만) */
  expiresAt?: string;
  /** 문서 설명 */
  description?: string;
  /** 업로드한 사람 */
  uploadedBy: string;
  createdAt: number;
  tags?: string[];
};

export const CHILD_DOCUMENT_CATEGORIES: { value: ChildDocumentCategory; tone: string; emoji: string }[] = [
  { value: "신분증", tone: "bg-blue-100 text-blue-700", emoji: "🪪" },
  { value: "예방접종", tone: "bg-emerald-100 text-emerald-700", emoji: "💉" },
  { value: "건강검진", tone: "bg-teal-100 text-teal-700", emoji: "🩺" },
  { value: "알레르기 진단", tone: "bg-amber-100 text-amber-700", emoji: "⚠️" },
  { value: "보호자 동의", tone: "bg-violet-100 text-violet-700", emoji: "✍️" },
  { value: "개별교육계획(IEP)", tone: "bg-indigo-100 text-indigo-700", emoji: "📋" },
  { value: "사고 보고", tone: "bg-red-100 text-red-700", emoji: "🚑" },
  { value: "발달평가", tone: "bg-pink-100 text-pink-700", emoji: "📈" },
  { value: "사진", tone: "bg-slate-100 text-slate-700", emoji: "📷" },
  { value: "아동상담", tone: "bg-violet-100 text-violet-700", emoji: "🧒" },
  { value: "보호자 상담", tone: "bg-rose-100 text-rose-700", emoji: "👨‍👩‍👧" },
  { value: "관찰일지", tone: "bg-cyan-100 text-cyan-700", emoji: "👀" },
  { value: "기타", tone: "bg-slate-100 text-slate-700", emoji: "📄" },
];
