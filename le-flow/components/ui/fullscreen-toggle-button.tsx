"use client";

type FullscreenToggleButtonProps = {
  isFullscreen: boolean;
  onToggle: () => void;
  className?: string;
};

export function FullscreenToggleButton({ isFullscreen, onToggle, className = "" }: FullscreenToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isFullscreen ? "Thoát full screen" : "Full screen"}
      className={`flex size-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/95 text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-900 ${className}`}
    >
      {isFullscreen ? (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
        </svg>
      ) : (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0-4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      )}
    </button>
  );
}
