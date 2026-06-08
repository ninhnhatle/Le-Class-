"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameCornerControls } from "@/components/ui/game-corner-controls";
import { SettingsToggleButton } from "@/components/ui/settings-toggle-button";
import { useFullscreenContainer } from "@/hooks/use-fullscreen-container";
import {
  KNOWLEDGE_SAMPLE_VIDEO_NAME,
  KNOWLEDGE_SAMPLE_VIDEO_PATH,
  type KnowledgeSettings,
} from "@/lib/knowledge/constants";
import {
  deleteCustomKnowledgeVideo,
  loadCustomKnowledgeVideo,
  saveCustomKnowledgeVideo,
} from "@/lib/knowledge/video-blob-store";
import { sanitizeKnowledgeSettings } from "@/lib/knowledge/utils";
import { STEP_IDS } from "@/lib/step-settings/keys";
import {
  loadStepSettingsRemote,
  persistStepSettingsRemote,
} from "@/lib/step-settings/storage";
import type { VideoQuestion } from "@/lib/interactive-video/types";
import {
  formatTime,
  getNextUnansweredQuestion,
  sortQuestionsByTime,
} from "@/lib/interactive-video/utils";
import {
  InteractiveVideoSettingsDialog,
  type KnowledgeSettingsSavePayload,
} from "./interactive-video-settings-dialog";
import { NextQuestionIndicator } from "./next-question-indicator";
import { QuestionOverlay } from "./question-overlay";
import { VideoTimeline } from "./video-timeline";

export function InteractiveVideoGame() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerResetKey, setPlayerResetKey] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [settings, setSettings] = useState<KnowledgeSettings>({
    videoSource: "sample",
    videoName: KNOWLEDGE_SAMPLE_VIDEO_NAME,
    questions: [],
  });
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const { containerRef, isFullscreen, portalContainer, toggleFullscreen } = useFullscreenContainer();
  const blobUrlRef = useRef<string | null>(null);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initFromStorage() {
      const { settings: stored } = await loadStepSettingsRemote(STEP_IDS.knowledge);
      if (cancelled) return;

      const sanitized = sanitizeKnowledgeSettings(stored);
      setSettings(sanitized);

      if (sanitized.videoSource === "custom") {
        const blob = await loadCustomKnowledgeVideo();
        if (cancelled) return;

        if (blob) {
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setVideoUrl(url);
        } else {
          const fallback = sanitizeKnowledgeSettings({
            ...sanitized,
            videoSource: "sample",
            videoName: KNOWLEDGE_SAMPLE_VIDEO_NAME,
          });
          setSettings(fallback);
          setVideoUrl(KNOWLEDGE_SAMPLE_VIDEO_PATH);
        }
      } else {
        setVideoUrl(KNOWLEDGE_SAMPLE_VIDEO_PATH);
      }

      setInitialized(true);
    }

    void initFromStorage();

    return () => {
      cancelled = true;
      revokeBlobUrl();
    };
  }, [revokeBlobUrl]);

  const handleToggleFullscreen = useCallback(async () => {
    if (!isFullscreen) setSettingsOpen(false);
    await toggleFullscreen();
  }, [isFullscreen, toggleFullscreen]);

  const saveSettings = async (payload: KnowledgeSettingsSavePayload) => {
    if (payload.removeCustomVideo) {
      await deleteCustomKnowledgeVideo();
    } else if (payload.pendingVideoBlob) {
      await saveCustomKnowledgeVideo(payload.pendingVideoBlob);
    }

    revokeBlobUrl();

    if (payload.settings.videoSource === "custom") {
      const blob = payload.pendingVideoBlob ?? (await loadCustomKnowledgeVideo());
      if (blob) {
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setVideoUrl(url);
      } else {
        setVideoUrl(payload.videoUrl);
      }
    } else {
      setVideoUrl(KNOWLEDGE_SAMPLE_VIDEO_PATH);
    }

    setSettings(payload.settings);
    await persistStepSettingsRemote(STEP_IDS.knowledge, payload.settings);
    setPlayerResetKey((prev) => prev + 1);
    setSettingsOpen(false);
  };

  const sortedQuestions = useMemo(() => sortQuestionsByTime(settings.questions), [settings.questions]);

  if (!initialized) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        Đang tải video và cài đặt đã lưu…
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`relative rounded-3xl ${
          isFullscreen
            ? "flex h-full min-h-screen flex-col justify-center bg-slate-950 p-4 sm:p-6"
            : "space-y-4 pt-12"
        }`}
      >
        <GameCornerControls
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenSettings={() => setSettingsOpen(true)}
          onReset={() => setPlayerResetKey((prev) => prev + 1)}
          showSettings={!isFullscreen}
          showReset={Boolean(videoUrl)}
        />

        {!isFullscreen ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Video tương tác</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {settings.questions.length > 0
                  ? `${settings.questions.length} câu hỏi sẽ xuất hiện khi video đến đúng thời điểm.`
                  : "Video sẽ phát liên tục (chưa có câu hỏi)."}
              </p>
            </div>
            {settings.videoName ? (
              <span className="max-w-xs truncate rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
                {settings.videoName}
              </span>
            ) : null}
          </div>
        ) : null}

        {videoUrl ? (
          <VideoPlayer
            key={playerResetKey}
            videoUrl={videoUrl}
            questions={sortedQuestions}
            isFullscreen={isFullscreen}
          />
        ) : (
          <div className="relative rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="text-sm text-slate-600">Chưa có video. Mở cài đặt để tải video hoặc dùng video mẫu.</p>
            <div className="mt-4 flex justify-center">
              <SettingsToggleButton onClick={() => setSettingsOpen(true)} />
            </div>
          </div>
        )}
      </div>

      {settingsOpen ? (
        <InteractiveVideoSettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          portalContainer={portalContainer}
          settings={settings}
          savedVideoUrl={videoUrl}
          onSave={saveSettings}
        />
      ) : null}
    </>
  );
}

type VideoPlayerProps = {
  videoUrl: string;
  questions: VideoQuestion[];
  isFullscreen: boolean;
};

function VideoPlayer({ videoUrl, questions, isFullscreen }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(() => new Set());
  const [activeQuestion, setActiveQuestion] = useState<VideoQuestion | null>(null);
  const [completed, setCompleted] = useState(false);
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
    <div className={isFullscreen ? "flex min-h-0 flex-1 flex-col" : "space-y-4"}>
      <div
        className={`video-player-stage relative w-full overflow-hidden bg-slate-950 ${
          isFullscreen ? "max-h-[calc(100vh-2rem)] min-h-0 flex-1 rounded-none" : "aspect-video rounded-2xl"
        }`}
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
        <div className="video-player-overlays pointer-events-none absolute inset-0 z-20">
          {!activeQuestion && !completed ? (
            <NextQuestionIndicator
              nextQuestion={nextQuestion}
              currentTime={currentTime}
              position={isFullscreen ? "bottom-left" : "top-right"}
            />
          ) : null}
        </div>
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
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Xem lại
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {!isFullscreen && questions.length > 0 && duration > 0 ? (
        <VideoTimeline
          duration={duration}
          currentTime={currentTime}
          questions={questions}
          answeredIds={answeredIds}
        />
      ) : null}
      {!isFullscreen && questions.length > 0 ? (
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
