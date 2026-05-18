"use client";

import { useCallback, useMemo, useState } from "react";
import { WHEEL_SLICE_COLORS } from "./constants";

type SpinWheelProps = {
  options: string[];
  className?: string;
};

const SPIN_DURATION_MS = 4200;
const MIN_FULL_SPINS = 5;
/** Pointer fixed at 3 o'clock (CSS conic: 0° = 12h, clockwise). */
const POINTER_DEG = 90;

function buildConicGradient(count: number): string {
  if (count === 0) return "conic-gradient(#e2e8f0 0deg 360deg)";
  const step = 360 / count;
  const stops = Array.from({ length: count }, (_, i) => {
    const color = WHEEL_SLICE_COLORS[i % WHEEL_SLICE_COLORS.length];
    const start = i * step;
    const end = (i + 1) * step;
    return `${color} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

/** Label at mid-radius; text orientation matches 3 o'clock (radial, rotation 0° at 90°). */
function getLabelPlacement(midAngleDeg: number) {
  const a = ((midAngleDeg % 360) + 360) % 360;
  const rad = ((a - 90) * Math.PI) / 180;
  const radiusPct = 36;
  const x = 50 + radiusPct * Math.cos(rad);
  const y = 50 + radiusPct * Math.sin(rad);
  const labelRotation = a - POINTER_DEG;
  return { x, y, labelRotation };
}

function computeTargetRotation(index: number, count: number, currentRotation: number): number {
  const segmentAngle = 360 / count;
  const segmentCenter = index * segmentAngle + segmentAngle / 2;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  let delta = POINTER_DEG - segmentCenter - currentMod;
  delta = ((delta % 360) + 360) % 360;
  if (delta === 0) delta = 360;
  return currentRotation + MIN_FULL_SPINS * 360 + delta;
}

export function SpinWheel({ options, className = "" }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const validOptions = useMemo(() => options.map((o) => o.trim()).filter(Boolean), [options]);
  const gradient = useMemo(() => buildConicGradient(validOptions.length), [validOptions.length]);
  const segmentAngle = validOptions.length > 0 ? 360 / validOptions.length : 0;

  const spin = useCallback(() => {
    if (spinning || validOptions.length < 2) return;

    const winnerIndex = Math.floor(Math.random() * validOptions.length);
    const target = computeTargetRotation(winnerIndex, validOptions.length, rotation);

    setSpinning(true);
    setResult(null);
    setRotation(target);

    window.setTimeout(() => {
      setSpinning(false);
      setResult(validOptions[winnerIndex]);
    }, SPIN_DURATION_MS);
  }, [spinning, validOptions, rotation]);

  if (validOptions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        Thêm ít nhất 2 mục trong Cài đặt để quay vòng.
      </p>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <div className="relative px-2">
        <div className="relative size-96 sm:size-[28rem]">
          <div
            className="absolute inset-0 overflow-hidden rounded-full border-4 border-white shadow-xl shadow-slate-300/50 ring-4 ring-slate-100"
            style={{
              background: gradient,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.15, 0.85, 0.2, 1)` : undefined,
            }}
          >
            {validOptions.map((label, i) => {
              const midAngle = i * segmentAngle + segmentAngle / 2;
              const { x, y, labelRotation } = getLabelPlacement(midAngle);
              const maxWidthPct = Math.min(44, Math.max(22, segmentAngle * 0.72));
              return (
                <span
                  key={`${label}-${i}`}
                  className="pointer-events-none absolute line-clamp-3 text-center text-xs font-semibold leading-snug text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] sm:text-sm"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    maxWidth: `${maxWidthPct}%`,
                    transform: `translate(-50%, -50%) rotate(${labelRotation}deg)`,
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>

          <div
            className="pointer-events-none absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-1/2"
            aria-hidden
          >
            <div className="relative size-0">
              <div className="absolute left-0 top-1/2 size-0 -translate-y-1/2 border-y-[15px] border-r-[28px] border-y-transparent border-r-white" />
              <div className="relative size-0 border-y-[13px] border-r-[24px] border-y-transparent border-r-slate-900 drop-shadow-sm" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex size-[4.25rem] items-center justify-center rounded-full border-4 border-white bg-slate-900 text-sm font-bold text-white shadow-inner">
              GO
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={spinning || validOptions.length < 2}
        className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {spinning ? "Đang quay..." : "Quay ngẫu nhiên"}
      </button>

      {result ? (
        <div
          className="w-full max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center"
          role="status"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-amber-800/80">Kết quả</p>
          <p className="mt-1 text-base font-semibold text-amber-950">{result}</p>
        </div>
      ) : null}
    </div>
  );
}
