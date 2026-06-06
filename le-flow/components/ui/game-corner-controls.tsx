"use client";

import { FullscreenToggleButton } from "@/components/ui/fullscreen-toggle-button";
import { SettingsToggleButton } from "@/components/ui/settings-toggle-button";

export const GAME_CORNER_CONTROLS_POSITION = {
  normal: "right-0 top-0",
  fullscreen: "right-4 top-4 sm:right-6 sm:top-6",
} as const;

type GameCornerControlsProps = {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings?: () => void;
  showSettings?: boolean;
  showFullscreen?: boolean;
  className?: string;
};

export function GameCornerControls({
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  showSettings = Boolean(onOpenSettings),
  showFullscreen = true,
  className = "",
}: GameCornerControlsProps) {
  if (!showSettings && !showFullscreen) return null;

  const positionClass = isFullscreen
    ? GAME_CORNER_CONTROLS_POSITION.fullscreen
    : GAME_CORNER_CONTROLS_POSITION.normal;

  return (
    <div className={`absolute z-10 flex items-center gap-2 ${positionClass} ${className}`}>
      {showSettings && onOpenSettings ? <SettingsToggleButton onClick={onOpenSettings} /> : null}
      {showFullscreen ? (
        <FullscreenToggleButton isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />
      ) : null}
    </div>
  );
}
