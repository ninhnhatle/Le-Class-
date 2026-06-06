"use client";

import { useCallback, useEffect, useRef } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  id?: string;
  allowImages?: boolean;
  size?: "md" | "lg";
};

type Command = "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList";

const TOOLBAR: { command: Command; label: string; icon: string }[] = [
  { command: "bold", label: "In đậm", icon: "B" },
  { command: "italic", label: "In nghiêng", icon: "I" },
  { command: "underline", label: "Gạch chân", icon: "U" },
  { command: "insertUnorderedList", label: "Danh sách", icon: "•" },
  { command: "insertOrderedList", label: "Số thứ tự", icon: "1." },
];

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = "6rem",
  id,
  allowImages = false,
  size = "md",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastHtmlRef = useRef(value);

  useEffect(() => {
    if (!editorRef.current || editorRef.current.innerHTML === value) return;
    editorRef.current.innerHTML = value || "";
    lastHtmlRef.current = value;
  }, [value]);

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    if (html !== lastHtmlRef.current) {
      lastHtmlRef.current = html;
      onChange(html);
    }
  }, [onChange]);

  const runCommand = (command: Command) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
    emitChange();
  };

  const insertImageFromFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_IMAGE_BYTES) {
      window.alert("Ảnh quá lớn. Vui lòng chọn file dưới 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      if (typeof src !== "string") return;
      editorRef.current?.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${src}" alt="" style="max-width:100%;height:auto;border-radius:0.5rem;margin:0.5rem 0;" />`,
      );
      emitChange();
    };
    reader.readAsDataURL(file);
  };

  const editorTextClass = size === "lg" ? "text-base" : "text-sm";
  const toolbarButtonClass = size === "lg" ? "size-9 text-sm" : "size-8 text-xs";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/10">
      <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50/80 px-2 py-1.5">
        {TOOLBAR.map(({ command, label, icon }) => (
          <button
            key={command}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand(command)}
            className={`flex items-center justify-center rounded-md font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 ${toolbarButtonClass}`}
          >
            {icon}
          </button>
        ))}
        {allowImages ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) insertImageFromFile(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              title="Chèn hình ảnh"
              aria-label="Chèn hình ảnh"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center justify-center rounded-md text-slate-600 transition hover:bg-white hover:text-slate-900 ${toolbarButtonClass}`}
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
            </button>
          </>
        ) : null}
      </div>
      <div
        ref={editorRef}
        id={id}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        className={`rich-text-editor min-w-0 px-3 py-2.5 leading-relaxed text-slate-900 outline-none [&_img]:my-2 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&:empty]:before:pointer-events-none [&:empty]:before:text-slate-400 [&:empty]:before:content-[attr(data-placeholder)] ${editorTextClass}`}
        style={{ minHeight }}
      />
    </div>
  );
}
