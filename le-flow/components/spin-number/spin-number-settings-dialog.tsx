"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import {
  DEFAULT_SPIN_NUMBER_SETTINGS,
  type SpinNumberMode,
  type SpinNumberSettings,
  sanitizeSpinNumberSettings,
} from "./constants";

type SpinNumberSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  settings: SpinNumberSettings;
  onSave: (settings: SpinNumberSettings) => void;
};

function parseListValues(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function SpinNumberSettingsDialog({ open, onClose, settings, onSave }: SpinNumberSettingsDialogProps) {
  const [title, setTitle] = useState(settings.title);
  const [subtitle, setSubtitle] = useState(settings.subtitle);
  const [resultDialogTitle, setResultDialogTitle] = useState(settings.resultDialogTitle);
  const [resultLabel, setResultLabel] = useState(settings.resultLabel);
  const [mode, setMode] = useState<SpinNumberMode>(settings.mode);
  const [listText, setListText] = useState(settings.listValues.join("\n"));
  const [maxNumberText, setMaxNumberText] = useState(String(settings.maxNumber));

  const handleSave = () => {
    const parsedMax = Number(maxNumberText);
    const next = sanitizeSpinNumberSettings({
      title,
      subtitle,
      resultDialogTitle,
      resultLabel,
      mode,
      listValues: parseListValues(listText),
      maxNumber: Number.isFinite(parsedMax) ? parsedMax : DEFAULT_SPIN_NUMBER_SETTINGS.maxNumber,
    });
    onSave(next);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cài đặt spin game"
      description="Chọn quay theo danh sách riêng hoặc quay số từ 1 đến N."
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
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Lưu
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="spin-title" className="mb-1.5 block text-sm font-medium text-slate-700">
            Tiêu đề
          </label>
          <input
            id="spin-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={DEFAULT_SPIN_NUMBER_SETTINGS.title}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div>
          <label htmlFor="spin-subtitle" className="mb-1.5 block text-sm font-medium text-slate-700">
            Mô tả
          </label>
          <input
            id="spin-subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder={DEFAULT_SPIN_NUMBER_SETTINGS.subtitle}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div>
          <label htmlFor="spin-result-dialog-title" className="mb-1.5 block text-sm font-medium text-slate-700">
            Tiêu đề dialog kết quả
          </label>
          <input
            id="spin-result-dialog-title"
            type="text"
            value={resultDialogTitle}
            onChange={(e) => setResultDialogTitle(e.target.value)}
            placeholder={DEFAULT_SPIN_NUMBER_SETTINGS.resultDialogTitle}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div>
          <label htmlFor="spin-result-label" className="mb-1.5 block text-sm font-medium text-slate-700">
            Nội dung hiển thị trước kết quả
          </label>
          <input
            id="spin-result-label"
            type="text"
            value={resultLabel}
            onChange={(e) => setResultLabel(e.target.value)}
            placeholder={DEFAULT_SPIN_NUMBER_SETTINGS.resultLabel}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
          />
          <p className="mt-1 text-xs text-slate-500">Ví dụ: &quot;Xin mời bạn số&quot;, &quot;Nhóm được chọn&quot;...</p>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Chế độ quay</legend>
          <div className="mt-2 grid gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input
                type="radio"
                name="spin-mode"
                value="range"
                checked={mode === "range"}
                onChange={() => setMode("range")}
              />
              Quay số từ 1 đến N
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input
                type="radio"
                name="spin-mode"
                value="list"
                checked={mode === "list"}
                onChange={() => setMode("list")}
              />
              Quay theo danh sách tự nhập
            </label>
          </div>
        </fieldset>

        {mode === "range" ? (
          <div>
            <label htmlFor="max-number" className="mb-1.5 block text-sm font-medium text-slate-700">
              Giá trị N
            </label>
            <input
              id="max-number"
              type="number"
              min={2}
              max={999}
              value={maxNumberText}
              onChange={(e) => setMaxNumberText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
            />
            <p className="mt-1 text-xs text-slate-500">Hệ thống sẽ tạo danh sách từ 1 đến N.</p>
          </div>
        ) : (
          <div>
            <label htmlFor="list-values" className="mb-1.5 block text-sm font-medium text-slate-700">
              Danh sách quay
            </label>
            <textarea
              id="list-values"
              rows={6}
              value={listText}
              onChange={(e) => setListText(e.target.value)}
              placeholder={"Nhóm 1\nNhóm 2\nNhóm 3"}
              className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
            />
            <p className="mt-1 text-xs text-slate-500">Mỗi dòng là một lựa chọn riêng.</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
