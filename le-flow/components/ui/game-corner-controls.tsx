"use client";

import { FullscreenToggleButton } from "@/components/ui/fullscreen-toggle-button";
import { GameIconButton } from "@/components/ui/game-icon-button";
import { SettingsToggleButton } from "@/components/ui/settings-toggle-button";

export const GAME_CORNER_CONTROLS_POSITION = {
  normal: "right-0 top-0",
  fullscreen: "right-4 top-4 sm:right-6 sm:top-6",
} as const;

type GameCornerControlsProps = {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings?: () => void;
  onReset?: () => void;
  showSettings?: boolean;
  showFullscreen?: boolean;
  showReset?: boolean;
  className?: string;
};

export function GameResetIcon() {
  return (
    <svg className="size-[1.125rem] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

export function GameCornerControls({
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  onReset,
  showSettings = Boolean(onOpenSettings),
  showFullscreen = true,
  showReset = Boolean(onReset),
  className = "",
}: GameCornerControlsProps) {
  const showResetButton = showReset && Boolean(onReset);
  if (!showSettings && !showFullscreen && !showResetButton) return null;

  const positionClass = isFullscreen
    ? GAME_CORNER_CONTROLS_POSITION.fullscreen
    : GAME_CORNER_CONTROLS_POSITION.normal;

  const overlayButtonClass = isFullscreen ? "border-white/70 bg-white/90 shadow-md backdrop-blur-sm" : "";

  return (
    <div className={`absolute z-20 flex items-center gap-2 ${positionClass} ${className}`}>
      {showResetButton ? (
        <GameIconButton
          onClick={onReset!}
          ariaLabel="Đặt lại"
          className={overlayButtonClass}
        >
          <GameResetIcon />
        </GameIconButton>
      ) : null}
      {showSettings && onOpenSettings ? (
        <SettingsToggleButton onClick={onOpenSettings} className={overlayButtonClass} />
      ) : null}
      {showFullscreen ? (
        <FullscreenToggleButton
          isFullscreen={isFullscreen}
          onToggle={onToggleFullscreen}
          className={overlayButtonClass}
        />
      ) : null}
    </div>
  );
}
