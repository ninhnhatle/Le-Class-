"use client";

import {
  secondsUntilQuestion,
  shouldShowNextQuestionHint,
} from "@/lib/interactive-video/utils";
import type { VideoQuestion } from "@/lib/interactive-video/types";

type NextQuestionIndicatorProps = {
  nextQuestion: VideoQuestion | null;
  currentTime: number;
  position?: "top-right" | "bottom-left";
};

export function NextQuestionIndicator({
  nextQuestion,
  currentTime,
  position = "top-right",
}: NextQuestionIndicatorProps) {
  if (!nextQuestion || !shouldShowNextQuestionHint(currentTime, nextQuestion.timeSeconds)) {
    return null;
  }

  const seconds = secondsUntilQuestion(currentTime, nextQuestion.timeSeconds);
  if (seconds <= 0) return null;

  const positionClass =
    position === "bottom-left"
      ? "bottom-4 left-4 sm:bottom-6 sm:left-6"
      : "top-4 right-4 sm:top-6 sm:right-6";

  return (
    <p
      className={`next-question-indicator-layer pointer-events-none absolute z-[60] ${positionClass} rounded-lg bg-slate-950/85 px-3 py-1.5 text-xs font-semibold tabular-nums text-white shadow-lg backdrop-blur-sm`}
      aria-live="polite"
    >
      Câu hỏi sau {seconds} giây
    </p>
  );
}
