"use client";

/**
 * Root providers — 모든 페이지를 감싸는 최상위 client provider 트리.
 *
 *   CustomProvider (rsuite, 한국어 locale)
 *     └ ToastProvider (components/ui/Toast — rsuite useToaster 기반)
 *         └ SessionProvider (lib/session — useSession 사용 가능)
 *             └ {children}
 *
 * 각 provider의 책임:
 * - CustomProvider: rsuite 훅(useToaster, useToaster 등)을 사용 가능하게 만듦.
 *   없으면 "Feature is disabled" 경고가 발생.
 * - ToastProvider: useToast() 훅을 자식 트리에 노출. 콘솔 fallback 포함.
 * - SessionProvider: useSession() 훅을 자식 트리에 노출. localStorage 동기화.
 *
 * AppShell.tsx에서는 위 provider들을 다시 감싸지 않음 (중복 방지).
 */
import { CustomProvider } from "rsuite";
import koKR from "rsuite/locales/ko_KR";
import { SessionProvider } from "@/lib/session";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CustomProvider locale={koKR}>
      <ToastProvider>
        <SessionProvider>{children}</SessionProvider>
      </ToastProvider>
    </CustomProvider>
  );
}