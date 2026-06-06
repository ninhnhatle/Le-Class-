"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SPIN_NUMBER_SETTINGS,
  type SpinNumberSettings,
  sanitizeSpinNumberSettings,
} from "@/components/spin-number/constants";
import { SpinNumberGame } from "@/components/spin-number/spin-number-game";
import { SpinNumberSettingsDialog } from "@/components/spin-number/spin-number-settings-dialog";
import { STEP_IDS } from "@/lib/step-settings/keys";
import {
  loadStepSettingsLocal,
  loadStepSettingsRemote,
  persistStepSettingsRemote,
} from "@/lib/step-settings/storage";

export function WarmupTabContent() {
  const [settings, setSettings] = useState<SpinNumberSettings>(() =>
    loadStepSettingsLocal(STEP_IDS.warmup, {
      defaults: DEFAULT_SPIN_NUMBER_SETTINGS,
      sanitize: sanitizeSpinNumberSettings,
    }),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gameResetKey, setGameResetKey] = useState(0);

  useEffect(() => {
    void loadStepSettingsRemote(STEP_IDS.warmup).then(({ settings: remote }) => {
      setSettings(remote);
    });
  }, []);

  const saveSettings = (nextSettings: SpinNumberSettings) => {
    setSettings(nextSettings);
    void persistStepSettingsRemote(STEP_IDS.warmup, nextSettings);
    setGameResetKey((prev) => prev + 1);
    setSettingsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-amber-200/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-6 left-1/3 size-24 rounded-full bg-orange-200/25 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-700/80">Giai đoạn 1</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Khởi động lớp học</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                Tạo không khí tích cực, ôn kiến thức cũ và dẫn dắt vào chủ đề bài mới qua hoạt động ngắn, vui.
              </p>
            </div>
          </div>
          <span className="w-fit shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            5–10 phút
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/80 p-6 shadow-md shadow-amber-100/50 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.12),transparent_55%)]" />
        <div className="relative mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 shadow-sm ring-1 ring-amber-100">
            <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
            Xổ số khởi động
          </span>
          <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{settings.title}</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">{settings.subtitle}</p>
        </div>

        <SpinNumberGame
          key={gameResetKey}
          settings={settings}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </div>

      {settingsOpen ? (
        <SpinNumberSettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          onSave={saveSettings}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-3.256 0c.85.493 1.508 1.333 1.508 2.316V18" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-wide">Gợi ý hoạt động</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Trò chơi từ vựng nhanh, tranh ảnh dẫn dắt, câu đố 60 giây hoặc chọn số/nhóm ngẫu nhiên.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-wide">Mẹo giảng dạy</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Bật full screen khi chiếu lên bảng — số quay sẽ hiển thị lớn, dễ nhìn từ cuối lớp.
          </p>
        </div>
      </div>
    </div>
  );
}
