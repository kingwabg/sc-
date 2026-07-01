/**
 * Children Feature — Store (localStorage)
 *
 * 실제 localStorage 로직은 lib/store/children.ts 에 구현되어 있습니다.
 * 이 파일은 lib/features/children/ 모듈에서 store 함수를 바로 import할 수 있도록
 * 재노출(re-export)하는 어댑터입니다.
 *
 * 사용: import { getExtraChildren } from "@/lib/features/children/store"
 * ( lib/store/children 에서 직접 import 해도 동일하게 동작합니다 — 하위 호환 )
 */
export {
  getChildGroups,
  setChildGroups,
  addChildGroup,
  updateChildGroup,
  removeChildGroup,
  moveChildGroup,
  updateGroupFilter,
  getExtraChildren,
  addExtraChild,
  updateExtraChild,
  removeExtraChild,
  getAttendanceOverrides,
  setAttendanceOverride,
  clearAttendanceOverrides,
  getExtraCareLogs,
  addExtraCareLog,
} from "@/lib/store/children";

export type { AttendanceMap } from "@/lib/store/children";
