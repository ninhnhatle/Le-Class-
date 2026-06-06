"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameCornerControls } from "@/components/ui/game-corner-controls";
import { Dialog } from "@/components/ui/dialog";
import type { SpinNumberSettings } from "./constants";

type SpinNumberGameProps = {
  settings: SpinNumberSettings;
  onOpenSettings?: () => void;
};

const INITIAL_TICK_DELAY_MS = 45;
const DELAY_GROWTH = 1.12;
const MAX_TICK_DELAY_MS = 500;
const SPIN_TICK_COUNT = 15;
/** Pause on final number before opening the result dialog. */
const STOP_PAUSE_MS = 200;

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
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const candidates = useMemo(() => buildCandidates(settings), [settings]);
  const canSpin = candidates.length >= 2;

  const stopSpin = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
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

  const displayValue = spinning || result ? currentValue : candidates[0] ?? "?";
  const visibleResult = showResultDialog && result && candidates.includes(result) ? result : null;

  const spin = useCallback(() => {
    if (!canSpin || spinning) return;

    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const winner = candidates[winnerIndex];

    stopSpin();
    setSpinning(true);
    setResult(null);
    setShowResultDialog(false);
    setCurrentValue(candidates[0] ?? winner);

    let tick = 0;
    let delay = INITIAL_TICK_DELAY_MS;

    const runTick = () => {
      if (tick >= SPIN_TICK_COUNT) {
        setCurrentValue(winner);
        setResult(winner);
        setSpinning(false);
        timerRef.current = window.setTimeout(() => {
          setShowResultDialog(true);
          timerRef.current = null;
        }, STOP_PAUSE_MS);
        return;
      }

      const isFinalTick = tick === SPIN_TICK_COUNT - 1;
      if (isFinalTick) {
        setCurrentValue(winner);
      } else {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        setCurrentValue(candidates[randomIndex]);
      }

      tick += 1;
      delay = Math.min(MAX_TICK_DELAY_MS, delay * DELAY_GROWTH);
      timerRef.current = window.setTimeout(runTick, delay);
    };

    timerRef.current = window.setTimeout(runTick, delay);
  }, [canSpin, candidates, spinning, stopSpin]);

  const closeResultDialog = useCallback(() => {
    setShowResultDialog(false);
    setResult(null);
  }, []);

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

      <div
        className={`relative w-full overflow-hidden rounded-3xl border border-amber-200/80 bg-white/95 text-center shadow-xl shadow-amber-200/40 ${
          isFullscreen ? "max-w-3xl p-10" : "max-w-md p-6"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(251,191,36,0.15),transparent_60%)]" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-amber-700/90">Kết quả quay</p>
        <div
          className={`relative mx-auto mt-5 flex aspect-square w-full items-center justify-center rounded-full border-2 border-amber-200/90 bg-gradient-to-br from-white via-amber-50 to-orange-100 shadow-lg shadow-amber-200/40 ${
            isFullscreen ? "max-w-[22rem] sm:max-w-[28rem]" : "max-w-[14rem] sm:max-w-[16rem]"
          } ${spinning ? "animate-pulse ring-4 ring-amber-300/50" : "ring-4 ring-amber-100/80"}`}
        >
          <div className="pointer-events-none absolute inset-3 rounded-full border border-dashed border-amber-300/40" />
          <span
            className={`relative bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text font-bold tracking-tight text-transparent ${
              isFullscreen ? "text-7xl sm:text-8xl" : "text-5xl sm:text-6xl"
            }`}
          >
            {displayValue}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={!canSpin || spinning}
        className={`rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:from-amber-600 hover:to-orange-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 ${
          isFullscreen ? "px-12 py-4 text-lg" : "px-8 py-3 text-sm"
        }`}
      >
        {spinning ? "Đang quay..." : "Bắt đầu"}
      </button>

      {visibleResult ? (
        <Dialog
          open
          onClose={closeResultDialog}
          title={settings.resultDialogTitle}
          portalContainer={portalContainer ?? undefined}
          footer={
            <button
              type="button"
              onClick={closeResultDialog}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Đóng
            </button>
          }
        >
          <div className="text-center">
            <p className="text-sm text-slate-600">{settings.resultLabel}</p>
            <div className="mx-auto mt-4 flex size-32 items-center justify-center rounded-full border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 shadow-md shadow-amber-100">
              <p className="bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent">
                {visibleResult}
              </p>
            </div>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
