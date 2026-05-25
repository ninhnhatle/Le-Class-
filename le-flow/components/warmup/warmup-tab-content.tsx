"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_WHEEL_COPY,
  DEFAULT_WHEEL_OPTIONS,
  WHEEL_COPY_STORAGE_KEY,
  WHEEL_OPTIONS_STORAGE_KEY,
  type WheelCopySettings,
} from "@/components/spin-wheel/constants";
import { SpinWheel } from "@/components/spin-wheel/spin-wheel";
import { WheelOptionsSettingsDialog } from "@/components/spin-wheel/wheel-options-settings-dialog";
import { fetchWheelSettings, saveWheelSettings } from "@/lib/wheel-settings/client";
import { toCopy } from "@/lib/wheel-settings/defaults";

type SyncStatus = "loading" | "sheet" | "local" | "error";

function loadStoredOptions(): string[] {
  if (typeof window === "undefined") return DEFAULT_WHEEL_OPTIONS;
  try {
    const raw = localStorage.getItem(WHEEL_OPTIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_WHEEL_OPTIONS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_WHEEL_OPTIONS;
    const cleaned = parsed.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
    return cleaned.length > 0 ? cleaned : DEFAULT_WHEEL_OPTIONS;
  } catch {
    return DEFAULT_WHEEL_OPTIONS;
  }
}

function loadStoredCopy(): WheelCopySettings {
  if (typeof window === "undefined") return DEFAULT_WHEEL_COPY;
  try {
    const raw = localStorage.getItem(WHEEL_COPY_STORAGE_KEY);
    if (!raw) return DEFAULT_WHEEL_COPY;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return DEFAULT_WHEEL_COPY;
    const record = parsed as Record<string, unknown>;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const subtitle = typeof record.subtitle === "string" ? record.subtitle.trim() : "";
    return {
      title: title || DEFAULT_WHEEL_COPY.title,
      subtitle: subtitle || DEFAULT_WHEEL_COPY.subtitle,
    };
  } catch {
    return DEFAULT_WHEEL_COPY;
  }
}

function cacheLocally(options: string[], copy: WheelCopySettings) {
  localStorage.setItem(WHEEL_OPTIONS_STORAGE_KEY, JSON.stringify(options));
  localStorage.setItem(WHEEL_COPY_STORAGE_KEY, JSON.stringify(copy));
}

function syncStatusLabel(status: SyncStatus): string {
  switch (status) {
    case "loading":
      return "Đang tải cài đặt…";
    case "sheet":
      return "Đã đồng bộ Google Sheet";
    case "local":
      return "Lưu cục bộ (chưa kết nối Sheet)";
    case "error":
      return "Lỗi đồng bộ — dùng bản cục bộ";
  }
}

export function WarmupTabContent() {
  const [options, setOptions] = useState<string[]>(DEFAULT_WHEEL_OPTIONS);
  const [copy, setCopy] = useState<WheelCopySettings>(DEFAULT_WHEEL_COPY);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchWheelSettings();
        if (cancelled) return;

        if (res.ok && res.data.options.length > 0) {
          setOptions(res.data.options);
          setCopy(toCopy(res.data));
          cacheLocally(res.data.options, toCopy(res.data));
          setSyncStatus(res.source === "google_sheet" ? "sheet" : "local");
          setSyncError(res.source === "google_sheet" ? null : res.error ?? null);
        } else {
          const localOptions = loadStoredOptions();
          const localCopy = loadStoredCopy();
          setOptions(localOptions);
          setCopy(localCopy);
          setSyncStatus("local");
          setSyncError(res.error ?? null);
        }
      } catch {
        if (cancelled) return;
        setOptions(loadStoredOptions());
        setCopy(loadStoredCopy());
        setSyncStatus("error");
        setSyncError("Không thể tải cài đặt từ máy chủ.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveSettings = useCallback(async (nextOptions: string[], nextCopy: WheelCopySettings) => {
    setSaving(true);
    setSaveError(null);
    setOptions(nextOptions);
    setCopy(nextCopy);
    cacheLocally(nextOptions, nextCopy);

    try {
      const res = await saveWheelSettings({
        title: nextCopy.title,
        subtitle: nextCopy.subtitle,
        options: nextOptions,
      });

      if (res.ok && res.source === "google_sheet") {
        setSyncStatus("sheet");
        setSyncError(null);
        setSettingsOpen(false);
      } else {
        setSyncStatus("local");
        setSaveError(res.error ?? "Không lưu được lên Google Sheet. Đã lưu trên trình duyệt.");
      }
    } catch {
      setSyncStatus("error");
      setSaveError("Không lưu được lên Google Sheet. Đã lưu trên trình duyệt.");
    } finally {
      setSaving(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Mục tiêu giai đoạn</h3>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Tạo không khí học tập tích cực, kết nối kiến thức cũ với bài mới và gợi mở câu hỏi trung tâm của tiết dạy.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-orange-50/40 p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{copy.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{copy.subtitle}</p>
            <p
              className={`mt-2 text-xs font-medium ${
                syncStatus === "sheet"
                  ? "text-emerald-700"
                  : syncStatus === "loading"
                    ? "text-slate-500"
                    : "text-amber-800"
              }`}
            >
              {syncStatusLabel(syncStatus)}
            </p>
            {syncError && syncStatus !== "sheet" ? (
              <p className="mt-1 text-xs text-slate-500">{syncError}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              setSaveError(null);
              setSettingsOpen(true);
            }}
            disabled={syncStatus === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
          >
            <svg className="size-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Cài đặt
          </button>
        </div>

        <SpinWheel options={options} />
      </div>

      <WheelOptionsSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        options={options}
        copy={copy}
        saving={saving}
        saveError={saveError}
        onSave={saveSettings}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-amber-50/80 p-5 ring-1 ring-amber-100">
          <p className="text-xs font-medium text-amber-800/90">Gợi ý hoạt động</p>
          <p className="mt-2 text-sm text-amber-950/80">Trò chơi từ vựng nhanh, tranh ảnh dẫn dắt, câu đố 60 giây.</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-100">
          <p className="text-xs font-medium text-slate-600">Thời lượng gợi ý</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">5–10 phút</p>
        </div>
      </div>
    </div>
  );
}
