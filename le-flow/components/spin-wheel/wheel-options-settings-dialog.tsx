"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_WHEEL_COPY,
  WHEEL_SUBTITLE_PRESETS,
  type WheelCopySettings,
} from "./constants";
import { Dialog } from "@/components/ui/dialog";

type WheelOptionsSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  options: string[];
  copy: WheelCopySettings;
  saving?: boolean;
  saveError?: string | null;
  onSave: (options: string[], copy: WheelCopySettings) => void | Promise<void>;
};

export function WheelOptionsSettingsDialog({
  open,
  onClose,
  options,
  copy,
  onSave,
  saving = false,
  saveError = null,
}: WheelOptionsSettingsDialogProps) {
  const [draft, setDraft] = useState<string[]>(options);
  const [copyDraft, setCopyDraft] = useState<WheelCopySettings>(copy);
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(options);
      setCopyDraft(copy);
      setNewOption("");
    }
  }, [open, options, copy]);

  const addOptions = () => {
    const lines = newOption
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    setDraft((prev) => [...prev, ...lines]);
    setNewOption("");
  };

  const clearAllOptions = () => {
    setDraft([]);
  };

  const removeOption = (index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleSave = async () => {
    const cleaned = draft.map((o) => o.trim()).filter(Boolean);
    const title = copyDraft.title.trim() || DEFAULT_WHEEL_COPY.title;
    const subtitle = copyDraft.subtitle.trim() || DEFAULT_WHEEL_COPY.subtitle;
    await onSave(cleaned, { title, subtitle });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cài đặt vòng quay"
      description="Tùy chỉnh tiêu đề, mô tả và các mục trên vòng quay."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {saveError ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">{saveError}</p>
        ) : null}
        <div>
          <label htmlFor="wheel-title" className="mb-1.5 block text-sm font-medium text-slate-700">
            Tiêu đề
          </label>
          <input
            id="wheel-title"
            type="text"
            value={copyDraft.title}
            onChange={(e) => setCopyDraft((prev) => ({ ...prev, title: e.target.value }))}
            placeholder={DEFAULT_WHEEL_COPY.title}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div>
          <label htmlFor="wheel-subtitle" className="mb-1.5 block text-sm font-medium text-slate-700">
            Mô tả
          </label>
          <input
            id="wheel-subtitle"
            type="text"
            value={copyDraft.subtitle}
            onChange={(e) => setCopyDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
            placeholder={DEFAULT_WHEEL_COPY.subtitle}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
          />
          <p className="mt-2 text-xs text-slate-500">Gợi ý nhanh:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {WHEEL_SUBTITLE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCopyDraft((prev) => ({ ...prev, subtitle: preset }))}
                className={`rounded-full border px-3 py-1 text-left text-xs transition ${
                  copyDraft.subtitle === preset
                    ? "border-sky-300 bg-sky-50 text-sky-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="my-5 border-t border-slate-100" />

      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-700">Các mục trên vòng quay</p>
        <button
          type="button"
          onClick={clearAllOptions}
          disabled={draft.length === 0}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Xóa tất cả
        </button>
      </div>

      <ul className="space-y-2">
        {draft.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500">
            Chưa có mục nào.
          </li>
        ) : (
          draft.map((option, index) => (
            <li key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900/10 focus:border-slate-400 focus:ring-2"
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                aria-label={`Xóa mục ${option}`}
              >
                Xóa
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="mt-4 space-y-2">
        <label htmlFor="wheel-new-options" className="block text-xs font-medium text-slate-600">
          Thêm mục mới
        </label>
        <textarea
          id="wheel-new-options"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              addOptions();
            }
          }}
          rows={4}
          placeholder={"Chào hỏi bằng tiếng Nhật\nĐoán từ vựng\nHát một bài ngắn"}
          className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">Mỗi dòng là một lựa chọn. Enter = xuống dòng.</p>
          <button
            type="button"
            onClick={addOptions}
            disabled={!newOption.trim()}
            className="shrink-0 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Thêm
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">Cần ít nhất 2 mục để quay vòng.</p>
    </Dialog>
  );
}
