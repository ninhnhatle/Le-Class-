"use client";

import { useState } from "react";
import {
  DEFAULT_SPIN_NUMBER_SETTINGS,
  SPIN_NUMBER_SETTINGS_STORAGE_KEY,
  type SpinNumberSettings,
  sanitizeSpinNumberSettings,
} from "@/components/spin-number/constants";
import { SpinNumberGame } from "@/components/spin-number/spin-number-game";
import { SpinNumberSettingsDialog } from "@/components/spin-number/spin-number-settings-dialog";

function loadStoredSettings(): SpinNumberSettings {
  if (typeof window === "undefined") return DEFAULT_SPIN_NUMBER_SETTINGS;
  try {
    const raw = localStorage.getItem(SPIN_NUMBER_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SPIN_NUMBER_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SpinNumberSettings>;
    return sanitizeSpinNumberSettings(parsed);
  } catch {
    return DEFAULT_SPIN_NUMBER_SETTINGS;
  }
}

export function WarmupTabContent() {
  const [settings, setSettings] = useState<SpinNumberSettings>(() => loadStoredSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gameResetKey, setGameResetKey] = useState(0);

  const saveSettings = (nextSettings: SpinNumberSettings) => {
    setSettings(nextSettings);
    localStorage.setItem(SPIN_NUMBER_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
    setGameResetKey((prev) => prev + 1);
    setSettingsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Mục tiêu giai đoạn</h3>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Tạo không khí học tập tích cực, kết nối kiến thức cũ với bài mới và gợi mở câu hỏi trung tâm của tiết dạy.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-orange-50/40 p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-900">{settings.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{settings.subtitle}</p>
          <p className="mt-2 text-xs font-medium text-amber-800">Xổ số ngẫu nhiên cho hoạt động khởi động</p>
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
