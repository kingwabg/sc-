"use client";

import { useRef, useState } from "react";
import { Camera, Upload, Trash2, X, Image as ImageIcon } from "lucide-react";

interface Props {
  photoUrl?: string;
  onUpload?: (file: File) => void;
  onDelete?: () => void;
}

export function PhotoTab({ photoUrl, onUpload, onDelete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(photoUrl);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload?.(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }

  function handleDelete() {
    setPreview(undefined);
    if (inputRef.current) inputRef.current.value = "";
    onDelete?.();
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-indigo-500" />
        사진 관리
      </h2>

      {/* 미리보기 영역 */}
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-colors ${
          dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="aspect-[3/4] max-h-96 flex items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt="staff"
              className="object-contain w-full h-full rounded-xl"
            />
          ) : (
            <div className="text-center text-slate-400">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">사진을 드래그하거나</p>
              <p className="text-xs">클릭하여 업로드하세요</p>
            </div>
          )}
        </div>

        {/* 오버레이 버튼 */}
        {preview && (
          <button
            onClick={handleDelete}
            className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 hover:bg-white text-red-500 hover:text-red-600 text-xs rounded-lg px-3 py-1.5 shadow-sm border border-red-100 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            삭제
          </button>
        )}
      </div>

      {/* 업로드 버튼 */}
      <div className="mt-4 flex gap-3">
        <label className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-xl py-2.5 cursor-pointer transition-colors shadow-sm">
          <Upload className="w-4 h-4" />
          <span>사진 업로드
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInputChange}
            />
          </span>
        </label>
        {preview && (
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 text-sm rounded-xl py-2.5 px-4 border border-red-200 hover:border-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-400 text-center">
        JPG, PNG, GIF 파일 가능 (최대 5MB)
      </p>
    </div>
  );
}
