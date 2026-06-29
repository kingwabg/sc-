"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  getMailAccounts,
  addMailAccount,
  removeMailAccount,
} from "@/lib/tenant-store";
import { PROVIDER_META } from "@/lib/data/mail-detail";
import type { MailAccount, MailProvider } from "@/lib/types/mail";
import {
  ArrowLeft,
  Plus,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Trash2,
  Mail,
  Globe,
  Settings,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Provider 메타 (data layer에서 import) ────────────────
const PROVIDERS = PROVIDER_META;

// ─── OAuth Mock 단계 ────────────────────────────────────────
type OAuthStep = "idle" | "redirect" | "consent" | "fetching" | "done";

export default function MailConnectPage() {
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<MailProvider | null>(null);
  const [oauthStep, setOauthStep] = useState<OAuthStep>("idle");

  useEffect(() => {
    setAccounts(getMailAccounts());
  }, []);

  function handleStartOAuth(provider: MailProvider) {
    setOauthProvider(provider);
    setOauthStep("redirect");
    // 시뮬레이션: 단계별 진행
    setTimeout(() => setOauthStep("consent"), 900);
    setTimeout(() => setOauthStep("fetching"), 2000);
    setTimeout(() => {
      // mock으로 fake 계정 추가
      const newAcc: MailAccount = {
        id: `ma-${Date.now()}`,
        provider,
        email: provider === "google" ? "you@gmail.com" : provider === "naver" ? "you@naver.com" : "you@daum.net",
        status: "connected",
        lastSyncAt: new Date().toLocaleString("ko-KR"),
      };
      const next = addMailAccount(newAcc);
      setAccounts(next);
      setOauthStep("done");
    }, 3000);
  }

  function handleCloseOAuth() {
    setOauthProvider(null);
    setOauthStep("idle");
  }

  function handleRemove(id: string) {
    const next = removeMailAccount(id);
    setAccounts(next);
  }

  return (
    <AppShell>
      <>
        {/* Header */}
        <div className="mb-5">
          <Link
            href="/mail"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 mb-3 transition"
          >
            <ArrowLeft className="w-3 h-3" />
            메일로 돌아가기
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-brand-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">외부 메일 연동</h1>
          </div>
          <p className="text-sm text-slate-500 m-0">
            Google · 네이버 · 다음 등 외부 메일 계정을 연결해 한 곳에서 관리하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4">
          {/* ─── 메인: 연동 방법 + 계정 목록 ─── */}
          <div className="space-y-4">
            {/* 추가 버튼 + Provider 카드 */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 m-0">새 외부 계정 추가</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(Object.keys(PROVIDERS) as MailProvider[]).map((p) => {
                  const meta = PROVIDERS[p];
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        if (p === "imap") {
                          setShowAdd(true);
                        } else {
                          handleStartOAuth(p);
                        }
                      }}
                      className={cn(
                        "group flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition text-left bg-white",
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl grid place-items-center text-2xl shrink-0",
                          meta.bg,
                        )}
                      >
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm">{meta.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {p === "imap" ? "IMAP/SMTP 직접 설정" : "OAuth 2.0 로그인으로 연동"}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 연동된 계정 목록 */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-bold text-slate-900 m-0">연동된 계정</h2>
                <span className="text-xs text-slate-500">({accounts.length})</span>
              </div>
              {accounts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  <Mail className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                  아직 연동된 외부 메일 계정이 없어요.
                  <div className="text-xs text-slate-400 mt-1">위 버튼을 눌러 첫 계정을 추가해 보세요.</div>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-[11px] font-semibold text-slate-500 uppercase">
                      <th className="px-4 py-2 text-left">계정</th>
                      <th className="px-4 py-2 text-left">이메일</th>
                      <th className="px-4 py-2 text-left">상태</th>
                      <th className="px-4 py-2 text-left">마지막 동기화</th>
                      <th className="px-4 py-2 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((a) => {
                      const meta = PROVIDERS[a.provider];
                      return (
                        <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-8 h-8 rounded-lg grid place-items-center text-base", meta.bg)}>
                                {meta.emoji}
                              </div>
                              <span className="font-semibold text-slate-900 text-[12.5px]">{meta.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[12.5px] text-slate-700">{a.email}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={a.status} />
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-500">{a.lastSyncAt ?? "—"}</td>
                          <td className="px-4 py-3 text-right">
                            <button className="inline-flex items-center gap-1 h-7 px-2 rounded text-[11px] text-slate-600 hover:bg-slate-100">
                              <RefreshCw className="w-3 h-3" />
                              동기화
                            </button>
                            <button
                              onClick={() => handleRemove(a.id)}
                              className="ml-1 inline-flex items-center gap-1 h-7 px-2 rounded text-[11px] text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                              해제
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ─── 우측: 도움말 / 안내 ─── */}
          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900 m-0">연동 가이드</h3>
              </div>
              <ol className="space-y-2.5 text-[12px] text-slate-700">
                <GuideStep n={1} title="공급자 선택">Google / 네이버 / 다음 중 하나 선택</GuideStep>
                <GuideStep n={2} title="OAuth 로그인">공급자 로그인 화면에서 인증</GuideStep>
                <GuideStep n={3} title="권한 허용">메일 읽기/쓰기 권한 부여</GuideStep>
                <GuideStep n={4} title="자동 동기화">10분마다 메일함 자동 갱신</GuideStep>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800 leading-relaxed">
                <b>현재는 UI 미리보기</b>입니다. 실제 외부 메일 동기화는 Supabase 백엔드 + OAuth 클라이언트 등록이 완료되면 활성화됩니다.
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed">
              <div className="font-bold text-slate-900 mb-1.5">데이터 보안</div>
              메일 본문은 우리 서버에 저장되지 않으며, OAuth 토큰은 암호화되어 안전하게 보관됩니다. 언제든 연동 해제 가능.
            </div>
          </aside>
        </div>

        {/* IMAP 직접 입력 모달 */}
        {showAdd && (
          <ImapModal
            onClose={() => setShowAdd(false)}
            onAdd={(acc) => {
              const next = addMailAccount(acc);
              setAccounts(next);
              setShowAdd(false);
            }}
          />
        )}

        {/* OAuth 시뮬레이션 모달 */}
        {oauthProvider && oauthStep !== "idle" && (
          <OAuthModal
            provider={oauthProvider}
            step={oauthStep}
            onClose={handleCloseOAuth}
          />
        )}
      </>
    </AppShell>
  );
}

// ─── Sub components ─────────────────────────────────────────
function StatusBadge({ status }: { status: MailAccount["status"] }) {
  const cfg = {
    connected: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "연결됨" },
    syncing: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "동기화 중" },
    error: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "오류" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold", cfg.bg, cfg.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot, status === "syncing" && "animate-pulse")} />
      {cfg.label}
    </span>
  );
}

function GuideStep({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 grid place-items-center text-[10px] font-bold shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <div className="font-semibold text-slate-900 text-[12px]">{title}</div>
        <div className="text-slate-500 text-[11px]">{children}</div>
      </div>
    </li>
  );
}

function ImapModal({ onClose, onAdd }: { onClose: () => void; onAdd: (a: MailAccount) => void }) {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("993");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 m-0 flex items-center gap-2">
            <Server className="w-4 h-4" />
            IMAP 직접 추가
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <Field label="IMAP 호스트">
            <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="imap.example.com" className="input" />
          </Field>
          <Field label="포트">
            <input value={port} onChange={(e) => setPort(e.target.value)} type="number" className="input" />
          </Field>
          <Field label="이메일">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
          </Field>
          <Field label="비밀번호 / 앱 비밀번호">
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="input" />
          </Field>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800 leading-relaxed">
            ⚠️ 현재는 UI 저장만 지원합니다. 실제 IMAP 연결은 백엔드 설정 후 동작합니다.
          </div>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="h-9 px-3 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
            취소
          </button>
          <button
            disabled={!host || !email || !password}
            onClick={() =>
              onAdd({
                id: `ma-${Date.now()}`,
                provider: "imap",
                email,
                status: "connected",
                imapHost: host,
                imapPort: parseInt(port),
                lastSyncAt: new Date().toLocaleString("ko-KR"),
              })
            }
            className="h-9 px-4 bg-brand-600 text-white text-sm font-bold rounded-md hover:bg-brand-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

function OAuthModal({
  provider,
  step,
  onClose,
}: {
  provider: MailProvider;
  step: OAuthStep;
  onClose: () => void;
}) {
  const meta = PROVIDERS[provider];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={step === "done" ? onClose : undefined}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {step === "done" ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 grid place-items-center mx-auto mb-3">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="text-base font-bold text-slate-900 mb-1">연동 완료</div>
            <div className="text-xs text-slate-500 mb-5">{meta.label} 계정이 연결되었습니다.</div>
            <button onClick={onClose} className="h-9 px-6 bg-brand-600 text-white text-sm font-bold rounded-md hover:bg-brand-700">
              확인
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className={cn("w-9 h-9 rounded-lg grid place-items-center text-xl", meta.bg)}>{meta.emoji}</div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{meta.label}</div>
                  <div className="text-[10px] text-slate-500">OAuth 2.0</div>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <FlowStep active={step !== "redirect"} done={(step as string) !== "redirect" && (step as string) !== "idle"}>
                공급자 로그인 화면으로 이동 중...
              </FlowStep>
              <FlowStep active={step === "consent"} done={(step as string) === "fetching" || (step as string) === "done"}>
                권한 요청 화면 — 메일 읽기/쓰기 허용
              </FlowStep>
              <FlowStep active={step === "fetching"} done={(step as string) === "done"}>
                메일함 가져오는 중...
              </FlowStep>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              잠시만 기다려주세요...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FlowStep({ active, done, children }: { active: boolean; done: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={cn(
          "w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold shrink-0 mt-0.5 transition",
          done ? "bg-emerald-100 text-emerald-700" : active ? "bg-brand-100 text-brand-700 ring-2 ring-brand-300" : "bg-slate-100 text-slate-400",
        )}
      >
        {done ? <Check className="w-3 h-3" /> : "·"}
      </div>
      <div className={cn("text-[12px]", active ? "text-slate-900 font-semibold" : "text-slate-400")}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-slate-600 mb-1">{label}</div>
      {children}
      <style jsx>{`
        :global(.input) {
          width: 100%;
          height: 36px;
          padding: 0 12px;
          border: 1px solid rgb(226 232 240);
          border-radius: 6px;
          font-size: 13px;
          outline: none;
        }
        :global(.input:focus) {
          border-color: rgb(99 102 241);
          box-shadow: 0 0 0 2px rgb(99 102 241 / 0.2);
        }
      `}</style>
    </div>
  );
}