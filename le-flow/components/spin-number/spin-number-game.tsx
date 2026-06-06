"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameCornerControls } from "@/components/ui/game-corner-controls";
import { Dialog } from "@/components/ui/dialog";
import type { SpinNumberSettings } from "./constants";

type SpinNumberGameProps = {
  settings: SpinNumberSettings;
  onOpenSettings?: () => void;
};

const SPIN_DURATION_MS = 2600;
const TICK_MS = 80;

function buildCandidates(settings: SpinNumberSettings): string[] {
  if (settings.mode === "range") {
    return Array.from({ length: settings.maxNumber }, (_, i) => String(i + 1));
  }
  return settings.listValues.map((item) => item.trim()).filter(Boolean);
}

export function SpinNumberGame({ settings, onOpenSettings }: SpinNumberGameProps) {
  const [spinning, setSpinning] = useState(false);
  const [currentValue, setCurrentValue] = useState("?");
  const [result, setResult] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const candidates = useMemo(() => buildCandidates(settings), [settings]);
  const canSpin = candidates.length >= 2;

  const stopSpin = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopSpin();
  }, [stopSpin]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = document.fullscreenElement === containerRef.current;
      setIsFullscreen(active);
      setPortalContainer(active && containerRef.current ? containerRef.current : null);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const displayValue = spinning ? currentValue : result ?? candidates[0] ?? "?";
  const visibleResult = result && candidates.includes(result) ? result : null;

  const spin = useCallback(() => {
    if (!canSpin || spinning) return;

    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const winner = candidates[winnerIndex];

    setSpinning(true);
    setResult(null);
    setCurrentValue(candidates[0]);

    intervalRef.current = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      setCurrentValue(candidates[randomIndex]);
    }, TICK_MS);

    timerRef.current = window.setTimeout(() => {
      stopSpin();
      setCurrentValue(winner);
      setResult(winner);
      setSpinning(false);
    }, SPIN_DURATION_MS);
  }, [canSpin, candidates, spinning, stopSpin]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (document.fullscreenElement === containerRef.current) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      // Ignore browser-level fullscreen permission or capability errors.
    }
  }, []);

  if (!canSpin) {
    return (
      <div className={`relative ${onOpenSettings ? "pt-12" : ""}`}>
        {onOpenSettings ? (
          <GameCornerControls
            isFullscreen={false}
            onToggleFullscreen={() => {}}
            showFullscreen={false}
            onOpenSettings={onOpenSettings}
          />
        ) : null}
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Cần ít nhất 2 lựa chọn để quay.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center gap-6 rounded-3xl ${
        isFullscreen
          ? "h-full w-full justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-6 sm:p-10"
          : "pt-12"
      }`}
    >
      <GameCornerControls
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenSettings={onOpenSettings}
        showSettings={!isFullscreen && Boolean(onOpenSettings)}
      />

      <div className={`relative w-full rounded-3xl border border-amber-200/80 bg-white/90 p-6 text-center shadow-lg shadow-amber-100/60 ${isFullscreen ? "max-w-2xl" : "max-w-md"}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700/80">Kết quả quay</p>
        <div className={`mt-4 rounded-2xl bg-slate-900 px-5 py-6 font-bold tracking-tight text-white ${isFullscreen ? "text-7xl" : "text-5xl sm:text-6xl"}`}>
          {displayValue}
        </div>
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={!canSpin || spinning}
        className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {spinning ? "Đang quay..." : "Bắt đầu"}
      </button>

      {visibleResult ? (
        <Dialog
          open
          onClose={() => setResult(null)}
          title={settings.resultDialogTitle}
          portalContainer={portalContainer ?? undefined}
          footer={
            <button
              type="button"
              onClick={() => setResult(null)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Đóng
            </button>
          }
        >
          <div className="text-center">
            <p className="text-sm text-slate-600">{settings.resultLabel}</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{visibleResult}</p>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
