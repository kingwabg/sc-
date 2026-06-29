"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type NaverEditorHandle = {
  getHTML: () => string;
  setHTML: (html: string) => void;
  isReady: () => boolean;
};

type Props = {
  initialHTML?: string;
  onChange?: (html: string) => void;
  onReady?: () => void;
};

type MessageFromIframe = {
  source?: string;
  type?: "ready" | "change";
  payload?: { html?: string };
};

const NaverEditorInner = forwardRef<NaverEditorHandle, Props>(function NaverEditor(
  { initialHTML = "", onChange, onReady },
  ref,
) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);
  const onReadyRef = useRef(onReady);
  onChangeRef.current = onChange;
  onReadyRef.current = onReady;

  useEffect(() => {
    function onMessage(e: MessageEvent<MessageFromIframe>) {
      const data = e.data;
      if (!data || data.source !== "se2" || !data.type) return;
      if (data.type === "ready") {
        readyRef.current = true;
        if (pendingRef.current != null) {
          const html = pendingRef.current;
          pendingRef.current = null;
          setTimeout(() => {
            const win = iframeRef.current?.contentWindow as (Window & { oEditorAPI?: { setHTML: (h: string) => void } }) | null;
            win?.oEditorAPI?.setHTML(html);
          }, 0);
        }
        onReadyRef.current?.();
      } else if (data.type === "change") {
        onChangeRef.current?.(data.payload?.html ?? "");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Push initial content once both iframe + editor are ready
  useEffect(() => {
    if (!initialHTML) return;
    pendingRef.current = initialHTML;
    if (readyRef.current && iframeRef.current?.contentWindow) {
      const win = iframeRef.current.contentWindow as (Window & { oEditorAPI?: { setHTML: (h: string) => void } }) | null;
      if (win?.oEditorAPI) {
        const html = pendingRef.current;
        pendingRef.current = null;
        win.oEditorAPI.setHTML(html);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getHTML: () => {
        const win = iframeRef.current?.contentWindow as (Window & { oEditorAPI?: { getHTML: () => string } }) | null;
        return win?.oEditorAPI?.getHTML?.() ?? "";
      },
      setHTML: (html: string) => {
        const win = iframeRef.current?.contentWindow as (Window & { oEditorAPI?: { setHTML: (h: string) => void } }) | null;
        if (!win?.oEditorAPI) return;
        if (!readyRef.current) {
          pendingRef.current = html;
          return;
        }
        win.oEditorAPI.setHTML(html);
      },
      isReady: () => readyRef.current,
    }),
    [],
  );

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white overflow-hidden">
      <iframe
        ref={iframeRef}
        src="/smarteditor2/office.html"
        title="SmartEditor 2"
        className="w-full block bg-white"
        style={{ height: 700, border: 0 }}
      />
    </div>
  );
});

export const NaverEditor = NaverEditorInner;