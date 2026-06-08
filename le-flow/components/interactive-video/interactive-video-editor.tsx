"use client";

import { useEffect, useRef, useState } from "react";
import type { KnowledgeVideoSource } from "@/lib/knowledge/constants";
import {
  QUESTION_TYPE_LABELS,
  type QuestionType,
  type VideoQuestion,
} from "@/lib/interactive-video/types";
import {
  createEmptyQuestion,
  formatTime,
  parseTimeInput,
} from "@/lib/interactive-video/utils";
import { VideoTimeline } from "./video-timeline";

export type InteractiveVideoEditorProps = {
  videoUrl: string | null;
  videoName: string;
  videoSource: KnowledgeVideoSource;
  questions: VideoQuestion[];
  editingTime: Record<string, string>;
  highlightedQuestionId: string | null;
  onUpload: (file: File | undefined) => void;
  onResetToSampleVideo: () => void;
  onAddQuestionAtTime: (timeSeconds: number) => void;
  onHighlightQuestion: (id: string | null) => void;
  onUpdateQuestion: (id: string, patch: Partial<VideoQuestion>) => void;
  onRemoveQuestion: (id: string) => void;
  onCommitTime: (id: string, raw: string) => boolean;
  onEditingTimeChange: (id: string, value: string) => void;
  onInitEditingTime: (id: string, value: string) => void;
};

export function InteractiveVideoEditor({
  videoUrl,
  videoName,
  videoSource,
  questions,
  editingTime,
  highlightedQuestionId,
  onUpload,
  onResetToSampleVideo,
  onAddQuestionAtTime,
  onHighlightQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onCommitTime,
  onEditingTimeChange,
  onInitEditingTime,
}: InteractiveVideoEditorProps) {
  useEffect(() => {
    if (!highlightedQuestionId) return;
    const el = document.getElementById(`question-card-${highlightedQuestionId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightedQuestionId, questions.length]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5">
        <h4 className="text-sm font-semibold text-slate-900">1. Tải video & đặt thời điểm</h4>
        <p className="mt-1 text-xs text-slate-500">
          Tua video, tạm dừng tại đoạn cần hỏi rồi nhấn thêm câu hỏi. Các điểm đỏ trên thanh thời gian là vị trí câu hỏi.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700">
            <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Chọn video
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(e) => {
                onUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {videoName ? (
            <>
              <span className="max-w-[14rem] truncate text-sm text-slate-600 sm:max-w-xs">{videoName}</span>
              {videoSource === "sample" ? (
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">Video mẫu</span>
              ) : null}
              {videoSource === "custom" ? (
                <button
                  type="button"
                  onClick={onResetToSampleVideo}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Dùng video mẫu
                </button>
              ) : null}
            </>
          ) : null}
        </div>
        {videoUrl ? (
          <EditorVideoPreview
            videoUrl={videoUrl}
            questions={questions}
            highlightedQuestionId={highlightedQuestionId}
            onAddQuestionAtTime={onAddQuestionAtTime}
            onHighlightQuestion={onHighlightQuestion}
          />
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">2. Nội dung câu hỏi</h4>
          <p className="mt-1 text-xs text-slate-500">Chỉnh loại câu hỏi, đáp án và nội dung cho từng thời điểm đã đặt.</p>
        </div>

        {!videoUrl ? (
          <p className="mt-4 text-sm text-slate-500">Hãy tải video trước khi thêm câu hỏi.</p>
        ) : questions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Chưa có câu hỏi. Tạm dừng video ở bước 1 và nhấn &quot;Thêm câu hỏi tại thời điểm này&quot;.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {questions.map((q, index) => (
              <QuestionEditorCard
                key={q.id}
                id={`question-card-${q.id}`}
                highlighted={highlightedQuestionId === q.id}
                index={index}
                question={q}
                timeInput={editingTime[q.id] ?? formatTime(q.timeSeconds)}
                onTimeChange={(v) => {
                  onInitEditingTime(q.id, formatTime(q.timeSeconds));
                  onEditingTimeChange(q.id, v);
                }}
                onTimeBlur={() => onCommitTime(q.id, editingTime[q.id] ?? formatTime(q.timeSeconds))}
                onUpdate={(patch) => onUpdateQuestion(q.id, patch)}
                onRemove={() => onRemoveQuestion(q.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type EditorVideoPreviewProps = {
  videoUrl: string;
  questions: VideoQuestion[];
  highlightedQuestionId: string | null;
  onAddQuestionAtTime: (timeSeconds: number) => void;
  onHighlightQuestion: (id: string | null) => void;
};

function EditorVideoPreview({
  videoUrl,
  questions,
  highlightedQuestionId,
  onAddQuestionAtTime,
  onHighlightQuestion,
}: EditorVideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, duration || time));
    setCurrentTime(video.currentTime);
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="relative overflow-hidden rounded-xl bg-slate-950">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="aspect-video max-h-72 w-full object-contain"
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d)) setDuration(d);
          }}
          onDurationChange={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d)) setDuration(d);
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onPlay={() => setIsPaused(false)}
          onPause={() => setIsPaused(true)}
          onEnded={() => setIsPaused(true)}
        />
        {isPaused ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center px-3 sm:bottom-16">
            <button
              type="button"
              className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-500"
              onClick={() => onAddQuestionAtTime(currentTime)}
            >
              <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Thêm câu hỏi tại {formatTime(currentTime)}
            </button>
          </div>
        ) : null}
      </div>

      <VideoTimeline
        duration={duration}
        currentTime={currentTime}
        questions={questions}
        highlightedQuestionId={highlightedQuestionId}
        interactive
        onSeek={seekTo}
        onMarkerClick={onHighlightQuestion}
      />
    </div>
  );
}

type QuestionEditorCardProps = {
  id: string;
  highlighted?: boolean;
  index: number;
  question: VideoQuestion;
  timeInput: string;
  onTimeChange: (value: string) => void;
  onTimeBlur: () => void;
  onUpdate: (patch: Partial<VideoQuestion>) => void;
  onRemove: () => void;
};

function QuestionEditorCard({
  id,
  highlighted,
  index,
  question,
  timeInput,
  onTimeChange,
  onTimeBlur,
  onUpdate,
  onRemove,
}: QuestionEditorCardProps) {
  const setType = (type: QuestionType) => {
    const base = createEmptyQuestion(type);
    onUpdate({
      type,
      options: base.options,
      correctIndex: base.correctIndex,
      correctTrueFalse: base.correctTrueFalse,
      acceptedAnswers: base.acceptedAnswers,
    });
  };

  return (
    <li
      id={id}
      className={`rounded-xl border p-4 transition ${
        highlighted ? "border-amber-300 bg-amber-50/80 ring-2 ring-amber-200/60" : "border-slate-100 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Câu {index + 1}</span>
        <button type="button" onClick={onRemove} className="text-xs font-medium text-rose-600 hover:text-rose-800">
          Xóa
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-slate-600">
          Thời điểm (phút:giây)
          <input
            type="text"
            value={timeInput}
            placeholder="00:20"
            onChange={(e) => onTimeChange(e.target.value)}
            onBlur={onTimeBlur}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Loại câu hỏi
          <select
            value={question.type}
            onChange={(e) => setType(e.target.value as QuestionType)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
              <option key={t} value={t}>
                {QUESTION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 block text-xs font-medium text-slate-600">
        Nội dung câu hỏi
        <textarea
          value={question.prompt}
          onChange={(e) => onUpdate({ prompt: e.target.value })}
          rows={2}
          placeholder="Ví dụ: Từ nào là danh từ trong câu sau?"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </label>

      {question.type === "multiple_choice" ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-slate-600">Các đáp án (chọn đáp án đúng)</p>
          {(question.options ?? ["", "", "", ""]).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={question.correctIndex === i}
                onChange={() => onUpdate({ correctIndex: i })}
                className="size-4 accent-sky-600"
                aria-label={`Đáp án đúng ${i + 1}`}
              />
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const next = [...(question.options ?? ["", "", "", ""])];
                  next[i] = e.target.value;
                  onUpdate({ options: next });
                }}
                placeholder={`Đáp án ${i + 1}`}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      ) : null}

      {question.type === "true_false" ? (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-600">Đáp án đúng</p>
          <div className="mt-2 flex gap-2">
            {[
              { value: true, label: "Đúng" },
              { value: false, label: "Sai" },
            ].map(({ value, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => onUpdate({ correctTrueFalse: value })}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  question.correctTrueFalse === value
                    ? "bg-sky-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {question.type === "free_text" ? (
        <label className="mt-3 block text-xs font-medium text-slate-600">
          Đáp án chấp nhận (mỗi dòng một đáp án, không phân biệt hoa thường)
          <textarea
            value={(question.acceptedAnswers ?? [""]).join("\n")}
            onChange={(e) =>
              onUpdate({
                acceptedAnswers: e.target.value.split("\n").map((s) => s.trim()),
              })
            }
            rows={2}
            placeholder={"ví dụ:\nHà Nội\nha noi"}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm"
          />
        </label>
      ) : null}
    </li>
  );
}
