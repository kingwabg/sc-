"use client";

/**
 * Root providers — 모든 페이지를 감싸는 최상위 client provider 트리.
 *
 *   CustomProvider (rsuite, 한국어 locale)
 *     └ ToastProvider (components/ui/Toast — rsuite useToaster 기반)
 *         └ SessionProvider (lib/session — useSession 사용 가능)
 *             └ {children}
 *
 * AppShell.tsx에서는 위 provider들을 다시 감싸지 않음 (중복 방지).
 *
 * Note: SessionProvider의 initialUser는 layout.tsx (Server Component)에서
 * getUser() 호출 후 prop으로 전달. Supabase 미설정 시 null.
 */
import { CustomProvider } from "rsuite";
import koKR from "rsuite/locales/ko_KR";
import { SessionProvider, type SessionUser } from "@/lib/session";
import { ToastProvider } from "@/components/ui/Toast";

type ProvidersProps = {
  children: React.ReactNode;
  /** Server layout.tsx에서传来的 초기 유저 (없으면 localStorage/mock 사용) */
  initialUser?: SessionUser | null;
};

export function Providers({ children, initialUser }: ProvidersProps) {
  return (
    <CustomProvider locale={koKR}>
      <ToastProvider>
        <SessionProvider initialUser={initialUser}>{children}</SessionProvider>
      </ToastProvider>
    </CustomProvider>
  );
}