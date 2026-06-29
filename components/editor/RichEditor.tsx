"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RichEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export function RichEditor({ value, onChange, placeholder, minHeight = 280 }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "내용을 입력하세요..." }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[200px]",
        style: `min-height: ${minHeight}px`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 transition">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const Btn = (props: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.title}
      className={cn(
        "w-8 h-8 grid place-items-center rounded-md text-slate-500 transition",
        props.active ? "bg-brand-50 text-brand-700" : "hover:bg-slate-100 hover:text-slate-900",
        props.disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      {props.children}
    </button>
  );

  function setLink() {
    const url = prompt("URL 입력", editor!.getAttributes("link").href ?? "");
    if (url === null) return;
    if (url === "") {
      editor!.chain().focus().unsetLink().run();
    } else {
      editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50/50">
      <Btn title="실행 취소" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="재실행" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="w-3.5 h-3.5" />
      </Btn>
      <Divider />
      <Btn title="제목 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="제목 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="제목 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="w-3.5 h-3.5" />
      </Btn>
      <Divider />
      <Btn title="굵게" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="기울임" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="취소선" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="코드" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="w-3.5 h-3.5" />
      </Btn>
      <Divider />
      <Btn title="글머리 목록" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="번호 목록" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="인용" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="w-3.5 h-3.5" />
      </Btn>
      <Btn title="구분선" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="w-3.5 h-3.5" />
      </Btn>
      <Divider />
      <Btn title="링크" active={editor.isActive("link")} onClick={setLink}>
        <LinkIcon className="w-3.5 h-3.5" />
      </Btn>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-slate-200 mx-1" />;
}