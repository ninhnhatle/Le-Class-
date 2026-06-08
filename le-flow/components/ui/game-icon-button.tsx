"use client";

type GameIconButtonProps = {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function GameIconButton({
  onClick,
  ariaLabel,
  children,
  className = "",
  disabled = false,
}: GameIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/95 text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
