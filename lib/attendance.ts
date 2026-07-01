/**
 * @deprecated  lib/features/attendance/ 을 직접 import하세요.
 *              이 파일은 하위 호환성을 위해서만 존재합니다.
 *
 * legacy import:  import { getAttendanceForYear, ... } from "@/lib/attendance"
 * new import:     import { getAttendanceForYear, ... } from "@/lib/features/attendance"
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  호환성 보장 표                                                   │
 * │  @/lib/attendance        →  @/lib/features/attendance          │
 * └─────────────────────────────────────────────────────────────┘
 */
export * from "./features/attendance";
