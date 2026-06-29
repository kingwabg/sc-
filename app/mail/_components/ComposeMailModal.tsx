"use client";

import { useState, useEffect } from "react";
import { RichEditor } from "@/components/editor/RichEditor";
import { X, Send, Save, Paperclip, Minus } from "lucide-react";

export function ComposeMailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!open) {
      setTo("");
      setSubject("");
      setBody("");
      setFiles([]);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900 m-0 text-sm">새 메일 쓰기</h3>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 grid place-items-center rounded text-slate-500 hover:bg-slate-200" title="최소화">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="w-7 h-7 grid place-items-center rounded text-slate-500 hover:bg-slate-200" title="닫기">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 입력 */}
        <div className="border-b border-slate-100 px-4 py-2 space-y-2">
          <div className="flex items-center gap-2">
            <label className="w-12 text-[11px] text-slate-500 font-semibold">받는 사람</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="name@example.com"
              className="flex-1 h-8 px-2 text-sm outline-none border-b border-transparent focus:border-brand-300 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-12 text-[11px] text-slate-500 font-semibold">제목</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="제목 입력"
              className="flex-1 h-8 px-2 text-sm outline-none border-b border-transparent focus:border-brand-300 transition"
            />
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <RichEditor value={body} onChange={setBody} placeholder="메일 본문을 작성하세요..." minHeight={260} />
        </div>

        {/* 첨부 */}
        {files.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 text-[11px]">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-600">
                <Paperclip className="w-3 h-3" />
                {f.name}
              </div>
            ))}
          </div>
        )}

        {/* 푸터 */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center gap-2">
          <button
            disabled={!to || !subject}
            className="h-9 px-4 inline-flex items-center gap-1.5 bg-brand-600 text-white rounded-md text-sm font-bold hover:bg-brand-700 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            보내기
          </button>
          <button className="h-9 px-3 inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-50 transition">
            <Save className="w-4 h-4" />
            임시저장
          </button>
          <label className="h-9 px-3 inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-50 transition cursor-pointer">
            <Paperclip className="w-4 h-4" />
            첨부
            <input type="file" multiple className="hidden" onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} />
          </label>
        </div>
      </div>
    </div>
  );
}