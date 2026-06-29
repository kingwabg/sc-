"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileUp, FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import type { RhwpEditor } from "@rhwp/editor";

const STORAGE_KEY = "office-portal:hwp-docs:v1";

type HwpDoc = {
  id: string;
  name: string;
  /** base64-encoded HWP/HWPX bytes */
  data: string;
  bytesLen: number;
  createdAt: number;
  updatedAt: number;
};

export default function HwpPage() {
  const [doc, setDoc] = useState<HwpDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const latest = JSON.parse(raw)[0] as HwpDoc | undefined;
      if (latest) setDoc(latest);
    } catch {}
  }, []);

  async function onFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const b64 = arrayBufferToBase64(buf);
      const next: HwpDoc = {
        id: `hwp-${Date.now()}`,
        name: file.name,
        data: b64,
        bytesLen: buf.byteLength,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      const next2 = [next, ...list].slice(0, 5);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next2));
      setDoc(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto pb-32">
        <div className="flex items-center justify-between py-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            문서 목록
          </Link>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".hwp,.hwpx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition disabled:opacity-50"
            >
              <FileUp className="w-4 h-4" />
              {loading ? "업로드 중…" : "HWP 파일 열기"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!doc && !loading && (
          <div className="mt-12 p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-700">HWP/HWPX 파일을 열어보세요</h2>
            <p className="text-sm text-slate-500 mt-2">
              위의 <strong>HWP 파일 열기</strong> 버튼을 누르거나, 아래 영역에 파일을 드롭하세요.
            </p>
            <p className="text-xs text-slate-400 mt-4">
              rhwp (Rust + WebAssembly) 기반 — 한컴 한글 .hwp / .hwpx 호환
            </p>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) onFile(f);
              }}
              className="mt-6 p-8 border border-slate-200 rounded-xl text-sm text-slate-400"
            >
              파일을 여기에 드롭
            </div>
          </div>
        )}

        {doc && <HwpView doc={doc} />}
      </div>
    </AppShell>
  );
}

function HwpView({ doc }: { doc: HwpDoc }) {
  // Decode base64 → ArrayBuffer and render via rhwp in an iframe wrapper.
  // We use a plain <iframe src="/smarteditor2/hwp-viewer.html"> to avoid
  // bundle bloat; alternatively wire up @rhwp/editor directly here.
  const [href, setHref] = useState<string>("");
  useEffect(() => {
    const bytes = base64ToUint8(doc.data);
    const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const blob = new Blob([buf], {
      type: doc.name.endsWith(".hwpx")
        ? "application/hwpx+zip"
        : "application/hwp",
    });
    const url = URL.createObjectURL(blob);
    setHref(url);
    return () => URL.revokeObjectURL(url);
  }, [doc]);

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <FileText className="w-4 h-4" />
        <span className="font-medium text-slate-900">{doc.name}</span>
        <span>·</span>
        <span>{(doc.bytesLen / 1024).toFixed(1)} KB</span>
      </div>
      <HwpEditorClient blobUrl={href} name={doc.name} />
    </div>
  );
}

function HwpEditorClient({ blobUrl, name }: { blobUrl: string; name: string }) {
  const [editor, setEditor] = useState<RhwpEditor | null>(null);
  const [pages, setPages] = useState<number>(0);
  useEffect(() => {
    let disposed = false;
    let ed: RhwpEditor | null = null;
    (async () => {
      const mod = await import("@rhwp/editor");
      ed = await mod.createEditor("#hwp-mount", {
        width: "100%",
        height: "700px",
      });
      if (disposed) {
        ed.destroy();
        return;
      }
      setEditor(ed);
      const resp = await fetch(blobUrl);
      const buf = await resp.arrayBuffer();
      const result = await ed.loadFile(buf, name);
      setPages(result.pageCount);
    })().catch((e) => console.error("[hwp]", e));
    return () => {
      disposed = true;
      ed?.destroy();
    };
  }, [blobUrl, name]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div id="hwp-mount" className="w-full" style={{ minHeight: 700 }} />
      {!editor && (
        <p className="px-4 py-3 text-xs text-slate-400 text-center">
          rhwp (Rust + WASM) 에디터 로딩 중…
        </p>
      )}
      {pages > 0 && (
        <p className="px-4 py-2 text-xs text-slate-400 text-right border-t border-slate-100">
          {pages}페이지
        </p>
      )}
    </div>
  );
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)) as unknown as number[],
    );
  }
  return btoa(bin);
}

function base64ToUint8(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
