"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NextQuestionIndicator } from "./next-question-indicator";
import { QuestionOverlay } from "./question-overlay";
import { VideoTimeline } from "./video-timeline";
import {
  QUESTION_TYPE_LABELS,
  type QuestionType,
  type VideoQuestion,
} from "@/lib/interactive-video/types";
import {
  createEmptyQuestion,
  createQuestionAtTime,
  formatTime,
  getNextUnansweredQuestion,
  parseTimeInput,
  sortQuestionsByTime,
} from "@/lib/interactive-video/utils";

type GameMode = "edit" | "play";

export function InteractiveVideoGame() {
  const [mode, setMode] = useState<GameMode>("edit");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>("");
  const [questions, setQuestions] = useState<VideoQuestion[]>([]);
  const [editingTime, setEditingTime] = useState<Record<string, string>>({});
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(null);

  const revokeUrl = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    return () => revokeUrl(videoUrl);
  }, [videoUrl, revokeUrl]);

  const handleVideoUpload = (file: File | undefined) => {
    if (!file || !file.type.startsWith("video/")) return;
    revokeUrl(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoName(file.name);
  };

  const addQuestionAtTime = (timeSeconds: number) => {
    const q = createQuestionAtTime(timeSeconds);
    setQuestions((prev) => sortQuestionsByTime([...prev, q]));
    setEditingTime((prev) => ({ ...prev, [q.id]: formatTime(q.timeSeconds) }));
    setHighlightedQuestionId(q.id);
  };

  const updateQuestion = (id: string, patch: Partial<VideoQuestion>) => {
    setQuestions((prev) => sortQuestionsByTime(prev.map((q) => (q.id === id ? { ...q, ...patch } : q))));
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setEditingTime((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const commitTime = (id: string, raw: string) => {
    const seconds = parseTimeInput(raw);
    if (seconds === null) return false;
    updateQuestion(id, { timeSeconds: seconds });
    setEditingTime((prev) => ({ ...prev, [id]: formatTime(seconds) }));
    return true;
  };

  const sortedQuestions = useMemo(() => sortQuestionsByTime(questions), [questions]);

  const canPlay = Boolean(videoUrl);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Video tương tác</h3>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Tải video lên, chèn câu hỏi tại thời điểm cụ thể. Khi phát, video dừng để học sinh trả lời đúng mới tiếp tục.
          </p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === "edit" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Thiết lập
          </button>
          <button
            type="button"
            onClick={() => setMode("play")}
            disabled={!canPlay}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              mode === "play" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Phát cho lớp
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <EditorPanel
          videoUrl={videoUrl}
          videoName={videoName}
          questions={sortedQuestions}
          editingTime={editingTime}
          onUpload={handleVideoUpload}
          onClearVideo={() => {
            revokeUrl(videoUrl);
            setVideoUrl(null);
            setVideoName("");
          }}
          highlightedQuestionId={highlightedQuestionId}
          onAddQuestionAtTime={addQuestionAtTime}
          onHighlightQuestion={setHighlightedQuestionId}
          onUpdateQuestion={updateQuestion}
          onRemoveQuestion={removeQuestion}
          onCommitTime={commitTime}
          onEditingTimeChange={(id, value) => setEditingTime((prev) => ({ ...prev, [id]: value }))}
          onInitEditingTime={(id, value) =>
            setEditingTime((prev) => (prev[id] !== undefined ? prev : { ...prev, [id]: value }))
          }
        />
      ) : videoUrl ? (
        <VideoPlayer videoUrl={videoUrl} questions={sortedQuestions} />
      ) : null}
    </div>
  );
}

type EditorPanelProps = {
  videoUrl: string | null;
  videoName: string;
  questions: VideoQuestion[];
  editingTime: Record<string, string>;
  highlightedQuestionId: string | null;
  onUpload: (file: File | undefined) => void;
  onClearVideo: () => void;
  onAddQuestionAtTime: (timeSeconds: number) => void;
  onHighlightQuestion: (id: string | null) => void;
  onUpdateQuestion: (id: string, patch: Partial<VideoQuestion>) => void;
  onRemoveQuestion: (id: string) => void;
  onCommitTime: (id: string, raw: string) => boolean;
  onEditingTimeChange: (id: string, value: string) => void;
  onInitEditingTime: (id: string, value: string) => void;
};

function EditorPanel({
  videoUrl,
  videoName,
  questions,
  editingTime,
  highlightedQuestionId,
  onUpload,
  onClearVideo,
  onAddQuestionAtTime,
  onHighlightQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onCommitTime,
  onEditingTimeChange,
  onInitEditingTime,
}: EditorPanelProps) {
  useEffect(() => {
    if (!highlightedQuestionId) return;
    const el = document.getElementById(`question-card-${highlightedQuestionId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightedQuestionId, questions.length]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900">1. Tải video & đặt thời điểm</h4>
        <p className="mt-1 text-xs text-slate-500">
          Tua video, tạm dừng tại đoạn cần hỏi rồi nhấn thêm câu hỏi. Các điểm đỏ trên thanh thời gian là vị trí câu hỏi.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
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
              <button type="button" onClick={onClearVideo} className="text-sm font-medium text-rose-600 hover:text-rose-800">
                Xóa video
              </button>
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

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">2. Nội dung câu hỏi</h4>
            <p className="mt-1 text-xs text-slate-500">Chỉnh loại câu hỏi, đáp án và nội dung cho từng thời điểm đã đặt.</p>
          </div>
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
              <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
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
        highlighted ? "border-amber-300 bg-amber-50/80 ring-2 ring-amber-200/60" : "border-slate-100 bg-slate-50/60"
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
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono"
          />
        </label>
      ) : null}
    </li>
  );
}

type VideoPlayerProps = {
  videoUrl: string;
  questions: VideoQuestion[];
};

function VideoPlayer({ videoUrl, questions }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(() => new Set());
  const [activeQuestion, setActiveQuestion] = useState<VideoQuestion | null>(null);
  const [completed, setCompleted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const nextQuestion = useMemo(
    () => getNextUnansweredQuestion(questions, currentTime, answeredIds),
    [questions, currentTime, answeredIds],
  );

  const resetPlayback = useCallback(() => {
    setAnsweredIds(new Set());
    setActiveQuestion(null);
    setCompleted(false);
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.pause();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || activeQuestion) return;

    const t = video.currentTime;
    const next = questions.find((q) => !answeredIds.has(q.id) && t >= q.timeSeconds - 0.15);
    if (next) {
      video.pause();
      setActiveQuestion(next);
    }
  };

  const handleCorrect = () => {
    if (!activeQuestion) return;
    const id = activeQuestion.id;
    setAnsweredIds((prev) => new Set(prev).add(id));
    setActiveQuestion(null);
    videoRef.current?.play();
  };

  const handleEnded = () => {
    const allAnswered = questions.every((q) => answeredIds.has(q.id));
    if (questions.length === 0 || allAnswered) {
      setCompleted(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {questions.length > 0
            ? `${questions.length} câu hỏi sẽ xuất hiện khi video đến đúng thời điểm.`
            : "Video sẽ phát liên tục (chưa có câu hỏi)."}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetPlayback}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Phát lại từ đầu
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0L15 9m5.25 11.25h-4.5m4.5 0L15 15"
              />
            </svg>
            {isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="video-player-stage relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950"
      >
        <div className="video-player-media absolute inset-0 z-0 flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            controls={!activeQuestion}
            controlsList="nofullscreen"
            disablePictureInPicture
            playsInline
            className={`max-h-full max-w-full object-contain ${activeQuestion ? "pointer-events-none" : "h-full w-full"}`}
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              if (Number.isFinite(d)) setDuration(d);
            }}
            onTimeUpdate={(e) => {
              setCurrentTime(e.currentTarget.currentTime);
              handleTimeUpdate();
            }}
            onEnded={handleEnded}
          />
        </div>
        {!activeQuestion && !completed ? (
          <NextQuestionIndicator
            nextQuestion={nextQuestion}
            currentTime={currentTime}
            position="top-right"
          />
        ) : null}
        {activeQuestion ? (
          <QuestionOverlay
            key={activeQuestion.id}
            question={activeQuestion}
            onCorrect={handleCorrect}
            fullscreen={isFullscreen}
          />
        ) : null}
        {completed ? (
          <div className="video-player-complete-layer absolute inset-0 z-[100] flex h-full w-full items-center justify-center bg-slate-950/80 p-6">
            <div className="rounded-2xl bg-white p-6 text-center shadow-xl">
              <p className="text-lg font-semibold text-emerald-700">Hoàn thành!</p>
              <p className="mt-2 text-sm text-slate-600">Học sinh đã xem hết video và trả lời đủ các câu hỏi.</p>
              <button
                type="button"
                onClick={resetPlayback}
                className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Xem lại
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {questions.length > 0 && duration > 0 ? (
        <VideoTimeline
          duration={duration}
          currentTime={currentTime}
          questions={questions}
          answeredIds={answeredIds}
        />
      ) : null}
      {questions.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {questions.map((q) => (
            <li
              key={q.id}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                answeredIds.has(q.id)
                  ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                  : "bg-slate-100 text-slate-600 ring-slate-200"
              }`}
            >
              {formatTime(q.timeSeconds)}
              {answeredIds.has(q.id) ? " ✓" : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
