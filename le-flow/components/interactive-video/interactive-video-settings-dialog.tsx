"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import {
  KNOWLEDGE_SAMPLE_VIDEO_NAME,
  KNOWLEDGE_SAMPLE_VIDEO_PATH,
  type KnowledgeSettings,
} from "@/lib/knowledge/constants";
import { sanitizeKnowledgeSettings } from "@/lib/knowledge/utils";
import type { VideoQuestion } from "@/lib/interactive-video/types";
import {
  createQuestionAtTime,
  formatTime,
  parseTimeInput,
  sortQuestionsByTime,
} from "@/lib/interactive-video/utils";
import { InteractiveVideoEditor } from "./interactive-video-editor";

export type KnowledgeSettingsSavePayload = {
  settings: KnowledgeSettings;
  videoUrl: string;
  pendingVideoBlob: Blob | null;
  removeCustomVideo: boolean;
};

type InteractiveVideoSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  settings: KnowledgeSettings;
  savedVideoUrl: string | null;
  portalContainer?: HTMLElement | null;
  onSave: (payload: KnowledgeSettingsSavePayload) => void | Promise<void>;
};

function buildEditingTime(questions: VideoQuestion[]): Record<string, string> {
  return Object.fromEntries(questions.map((q) => [q.id, formatTime(q.timeSeconds)]));
}

export function InteractiveVideoSettingsDialog({
  open,
  onClose,
  settings,
  savedVideoUrl,
  portalContainer,
  onSave,
}: InteractiveVideoSettingsDialogProps) {
  const [draft, setDraft] = useState(settings);
  const [draftVideoUrl, setDraftVideoUrl] = useState<string | null>(savedVideoUrl);
  const [editingTime, setEditingTime] = useState<Record<string, string>>(() => buildEditingTime(settings.questions));
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(null);
  const [pendingVideoBlob, setPendingVideoBlob] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);

  const savedSettingsRef = useRef(settings);
  const sessionBlobUrlsRef = useRef<string[]>([]);

  const revokeSessionBlobUrls = () => {
    sessionBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    sessionBlobUrlsRef.current = [];
  };

  useEffect(() => {
    if (!open) return;

    savedSettingsRef.current = settings;
    setDraft(settings);
    setDraftVideoUrl(savedVideoUrl);
    setEditingTime(buildEditingTime(settings.questions));
    setHighlightedQuestionId(null);
    setPendingVideoBlob(null);
    revokeSessionBlobUrls();
  }, [open, settings, savedVideoUrl]);

  const handleCancel = () => {
    revokeSessionBlobUrls();
    onClose();
  };

  const handleUpload = (file: File | undefined) => {
    if (!file || !file.type.startsWith("video/")) return;

    revokeSessionBlobUrls();
    const url = URL.createObjectURL(file);
    sessionBlobUrlsRef.current.push(url);
    setPendingVideoBlob(file);
    setDraftVideoUrl(url);
    setDraft((prev) => ({
      ...prev,
      videoSource: "custom",
      videoName: file.name,
    }));
  };

  const handleResetToSampleVideo = () => {
    revokeSessionBlobUrls();
    setPendingVideoBlob(null);
    setDraftVideoUrl(KNOWLEDGE_SAMPLE_VIDEO_PATH);
    setDraft((prev) => ({
      ...prev,
      videoSource: "sample",
      videoName: KNOWLEDGE_SAMPLE_VIDEO_NAME,
    }));
  };

  const addQuestionAtTime = (timeSeconds: number) => {
    const q = createQuestionAtTime(timeSeconds);
    setDraft((prev) => ({
      ...prev,
      questions: sortQuestionsByTime([...prev.questions, q]),
    }));
    setEditingTime((prev) => ({ ...prev, [q.id]: formatTime(q.timeSeconds) }));
    setHighlightedQuestionId(q.id);
  };

  const updateQuestion = (id: string, patch: Partial<VideoQuestion>) => {
    setDraft((prev) => ({
      ...prev,
      questions: sortQuestionsByTime(prev.questions.map((q) => (q.id === id ? { ...q, ...patch } : q))),
    }));
  };

  const removeQuestion = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
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

  const handleSave = async () => {
    const sanitized = sanitizeKnowledgeSettings(draft);
    const videoUrl =
      sanitized.videoSource === "sample"
        ? KNOWLEDGE_SAMPLE_VIDEO_PATH
        : draftVideoUrl ?? savedVideoUrl ?? KNOWLEDGE_SAMPLE_VIDEO_PATH;

    setSaving(true);
    try {
      await onSave({
        settings: sanitized,
        videoUrl,
        pendingVideoBlob,
        removeCustomVideo:
          sanitized.videoSource === "sample" && savedSettingsRef.current.videoSource === "custom",
      });
      revokeSessionBlobUrls();
    } finally {
      setSaving(false);
    }
  };

  const sortedQuestions = sortQuestionsByTime(draft.questions);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      title="Cài đặt video tương tác"
      description="Tải video, đặt thời điểm và soạn câu hỏi. Nhấn Lưu để ghi lên Google Sheet."
      size="2xl"
      portalContainer={portalContainer}
      preventOutsideClose
      footer={
        <>
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        </>
      }
    >
      <InteractiveVideoEditor
        videoUrl={draftVideoUrl}
        videoName={draft.videoName}
        videoSource={draft.videoSource}
        questions={sortedQuestions}
        editingTime={editingTime}
        highlightedQuestionId={highlightedQuestionId}
        onUpload={handleUpload}
        onResetToSampleVideo={handleResetToSampleVideo}
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
    </Dialog>
  );
}
