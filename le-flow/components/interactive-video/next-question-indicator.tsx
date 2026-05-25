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

  const positionClass = position === "bottom-left" ? "bottom-3 left-3" : "top-3 right-3";

  return (
    <p
      className={`next-question-indicator-layer pointer-events-none absolute z-40 ${positionClass} rounded-md bg-slate-950/75 px-2 py-1 text-[11px] font-medium tabular-nums text-white/90 backdrop-blur-sm`}
      aria-live="polite"
    >
      Câu hỏi sau {seconds} giây
    </p>
  );
}
