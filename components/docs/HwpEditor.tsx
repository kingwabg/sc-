"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import type { RhwpEditor } from "@rhwp/editor";

export type HwpEditorHandle = {
  isReady: () => boolean;
  loadFile: (data: ArrayBuffer | Uint8Array, name?: string) => Promise<void>;
  exportHwp: () => Promise<Uint8Array | null>;
  pageCount: () => Promise<number>;
};

type Props = {
  initialFile?: { data: ArrayBuffer; name: string } | null;
  onChange?: (bytes: Uint8Array) => void;
  onReady?: () => void;
};

const HwpEditorInner = forwardRef<HwpEditorHandle, Props>(function HwpEditor(
  { initialFile, onChange, onReady },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<RhwpEditor | null>(null);
  const readyRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    let disposed = false;
    let editor: RhwpEditor | null = null;

    (async () => {
      if (!containerRef.current) return;
      const mod = await import("@rhwp/editor");
      if (disposed) return;
      editor = await mod.createEditor(containerRef.current, {
        width: "100%",
        height: "700px",
      });
      if (disposed) {
        editor.destroy();
        return;
      }
      editorRef.current = editor;
      readyRef.current = true;
      onReadyRef.current?.();
      if (initialFile) {
        await editor.loadFile(initialFile.data, initialFile.name);
      }
    })().catch((e) => {
      console.error("[HwpEditor] init failed:", e);
    });

    return () => {
      disposed = true;
      editor?.destroy();
      editorRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      isReady: () => readyRef.current,
      loadFile: async (data, name) => {
        if (!editorRef.current) return;
        await editorRef.current.loadFile(data, name);
      },
      exportHwp: async () => {
        if (!editorRef.current) return null;
        try {
          return await editorRef.current.exportHwp();
        } catch (e) {
          console.error("[HwpEditor] exportHwp failed:", e);
          return null;
        }
      },
      pageCount: async () => {
        if (!editorRef.current) return 0;
        try {
          return await editorRef.current.pageCount();
        } catch {
          return 0;
        }
      },
    }),
    [],
  );

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div ref={containerRef} className="w-full" style={{ minHeight: 700 }} />
      {!readyRef.current && (
        <p className="px-4 py-3 text-xs text-slate-400 text-center">
          HWP 에디터 로딩 중… (rhwp WASM 다운로드)
        </p>
      )}
      {onChange && (
        <ExportButton editorRef={editorRef} onChange={onChange} />
      )}
    </div>
  );
});

function ExportButton({
  editorRef,
  onChange,
}: {
  editorRef: React.MutableRefObject<RhwpEditor | null>;
  onChange: (bytes: Uint8Array) => void;
}) {
  return (
    <button
      type="button"
      onClick={async () => {
        const ed = editorRef.current;
        if (!ed) return;
        const bytes = await ed.exportHwp();
        if (bytes) onChange(bytes);
      }}
      className="m-2 px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
    >
      HWP 다운로드
    </button>
  );
}

export const HwpEditor = HwpEditorInner;