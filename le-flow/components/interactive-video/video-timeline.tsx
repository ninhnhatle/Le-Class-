"use client";

import { formatTime } from "@/lib/interactive-video/utils";
import type { VideoQuestion } from "@/lib/interactive-video/types";

type VideoTimelineProps = {
  duration: number;
  currentTime: number;
  questions: VideoQuestion[];
  answeredIds?: Set<string>;
  highlightedQuestionId?: string | null;
  interactive?: boolean;
  onSeek?: (time: number) => void;
  onMarkerClick?: (questionId: string) => void;
};

export function VideoTimeline({
  duration,
  currentTime,
  questions,
  answeredIds,
  highlightedQuestionId,
  interactive = false,
  onSeek,
  onMarkerClick,
}: VideoTimelineProps) {
  const safeDuration = duration > 0 ? duration : 0;
  const progress = safeDuration > 0 ? Math.min(100, (currentTime / safeDuration) * 100) : 0;

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onSeek || safeDuration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * safeDuration);
  };

  if (safeDuration <= 0) {
    return (
      <p className="text-xs text-slate-500">Đang tải thời lượng video…</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-medium tabular-nums text-slate-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(safeDuration)}</span>
      </div>

      <div
        className={`relative h-8 ${interactive ? "cursor-pointer" : ""}`}
        onClick={handleTrackClick}
        role={interactive ? "slider" : undefined}
        aria-label={interactive ? "Thanh thời gian video" : undefined}
        aria-valuemin={0}
        aria-valuemax={safeDuration}
        aria-valuenow={currentTime}
      >
        <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-sky-500/80 transition-[width]"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 z-10 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-600 shadow-md"
          style={{ left: `${progress}%` }}
        />

        {questions.map((q, index) => {
          const left = (q.timeSeconds / safeDuration) * 100;
          const answered = answeredIds?.has(q.id);
          const highlighted = highlightedQuestionId === q.id;
          return (
            <button
              key={q.id}
              type="button"
              title={`Câu ${index + 1} · ${formatTime(q.timeSeconds)}${q.prompt ? ` · ${q.prompt.slice(0, 40)}` : ""}`}
              className={`absolute top-1/2 z-20 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[9px] font-bold shadow-sm transition hover:scale-110 ${
                answered
                  ? "border-emerald-200 bg-emerald-500 text-white"
                  : highlighted
                    ? "border-amber-300 bg-amber-500 text-white ring-2 ring-amber-200"
                    : "border-white bg-rose-500 text-white hover:bg-rose-600"
              }`}
              style={{ left: `${Math.min(100, Math.max(0, left))}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onMarkerClick?.(q.id);
                if (interactive && onSeek) onSeek(q.timeSeconds);
              }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {questions.length > 0 ? (
        <p className="text-[11px] text-slate-500">
          <span className="inline-block size-2 rounded-full bg-rose-500 align-middle" /> Câu hỏi trên thanh thời gian
          {interactive ? " · Nhấn để tua đến vị trí" : null}
        </p>
      ) : null}
    </div>
  );
}
