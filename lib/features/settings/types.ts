// Settings — 좌측 네비게이션 데이터 타입 (다우오피스 스타일)

export type SettingGroup = {
  id: string;
  label: string;
  /** 좌측 최상위 카테고리 (My / Management) */
  scope: "My" | "Management";
  icon?: string;
  /** 중간 사이드바 항목 */
  items: SettingItem[];
};

export type SettingItem = {
  id: string;
  label: string;
  /** 좌측 확장 가능 그룹 */
  expandable?: boolean;
  /** 펼침 시 표시될 서브 항목 */
  children?: SettingSubItem[];
};

export type SettingSubItem = {
  id: string;
  label: string;
  description?: string;
};
