/**
 * DocumentIndex — 통합 문서 인덱스 타입
 *
 * 모든 "문서성" 데이터의 단일 인덱스. Write-through 방식으로:
 *  - HTML 문서 (/docs)
 *  - 아동카드 observations (/children/[id])
 *  - 돌봄일지 (/children/[id])
 *  - 아동 첨부 문서 (/children/[id]/documents)
 * 가 작성될 때마다 1행이 추가됨.
 *
 * 미래 DB 이전 시 이 인덱스만 옮기면 됨.
 */

export type DocumentKind =
  | "html-doc"        // /docs 의 HTML 에디터 문서
  | "hwp-doc"         // /docs/hwp 의 HWP 파일
  | "child-card"      // /children/[id] 의 아동카드 observations
  | "care-log"        // 돌봄일지 (식사/학습/놀이/관찰 등)
  | "child-document"; // /children/[id]/documents 의 첨부 문서 (IEP, 사진 등)

export type DocumentIndexEntry = {
  /** = 원본 데이터의 ID (예: doc id, care-log id, child id) */
  id: string;
  kind: DocumentKind;
  title: string;
  /** 본문 발췌 (목록 미리보기용) */
  snippet?: string;
  /** 클릭 시 이동할 경로 (예: "/children/c01?tab=basic") */
  sourceUrl: string;
  /** 아동 관련 문서면 */
  childId?: string;
  authorId: string;
  authorName: string;
  /** epoch ms */
  createdAt: number;
  updatedAt: number;
  /** kind별 추가 정보 (예: category, fileType, logCategory 등) */
  meta?: Record<string, string | number | boolean | undefined>;
};

export type DocumentIndexFilter = {
  kind?: DocumentKind | "all";
  childId?: string;
  authorId?: string;
  /** 제목/스니펫 검색어 */
  query?: string;
  /** epoch ms */
  from?: number;
  to?: number;
};
