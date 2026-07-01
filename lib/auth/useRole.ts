/**
 * lib/auth/useRole.ts
 *
 * P13 — exec portal 사이드바 분기용
 * 쿠키 `officex-role` 에서 역할 읽기
 * - exec   : 임원 (회계 포털)
 * - staff  : 직원 (기본 사이드바)
 * - facility: 시설 관리자
 * - center : 센터장
 *
 * 쿠키 없으면 'staff' 기본값
 */

"use client";

import { useState, useEffect } from "react";

export type Role = "exec" | "staff" | "facility" | "center";

const COOKIE_NAME = "officex-role";
const DEFAULT_ROLE: Role = "staff";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function useRole(): Role {
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);

  useEffect(() => {
    const val = getCookie(COOKIE_NAME) as Role | null;
    if (val && ["exec", "staff", "facility", "center"].includes(val)) {
      setRole(val);
    }
  }, []);

  return role;
}
