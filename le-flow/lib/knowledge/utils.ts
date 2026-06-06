import type { QuestionType, VideoQuestion } from "@/lib/interactive-video/types";
import { sortQuestionsByTime } from "@/lib/interactive-video/utils";
import {
  DEFAULT_KNOWLEDGE_SETTINGS,
  KNOWLEDGE_SAMPLE_VIDEO_NAME,
  type KnowledgeSettings,
  type KnowledgeVideoSource,
} from "./constants";

function sanitizeQuestion(input: unknown): VideoQuestion | null {
  if (!input || typeof input !== "object") return null;
  const q = input as Partial<VideoQuestion>;
  if (typeof q.id !== "string" || typeof q.timeSeconds !== "number" || typeof q.prompt !== "string") {
    return null;
  }

  const type: QuestionType =
    q.type === "true_false" || q.type === "free_text" ? q.type : "multiple_choice";

  return {
    id: q.id,
    timeSeconds: Math.max(0, q.timeSeconds),
    type,
    prompt: q.prompt,
    options: Array.isArray(q.options) ? q.options.filter((o): o is string => typeof o === "string") : undefined,
    correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : undefined,
    correctTrueFalse: typeof q.correctTrueFalse === "boolean" ? q.correctTrueFalse : undefined,
    acceptedAnswers: Array.isArray(q.acceptedAnswers)
      ? q.acceptedAnswers.filter((a): a is string => typeof a === "string")
      : undefined,
  };
}

export function sanitizeKnowledgeSettings(input: unknown): KnowledgeSettings {
  if (!input || typeof input !== "object") return DEFAULT_KNOWLEDGE_SETTINGS;

  const raw = input as Partial<KnowledgeSettings>;
  const videoSource: KnowledgeVideoSource = raw.videoSource === "custom" ? "custom" : "sample";
  const questions = Array.isArray(raw.questions)
    ? sortQuestionsByTime(
        raw.questions.map(sanitizeQuestion).filter((q): q is VideoQuestion => q !== null),
      )
    : DEFAULT_KNOWLEDGE_SETTINGS.questions;

  const videoName =
    typeof raw.videoName === "string" && raw.videoName.trim()
      ? raw.videoName.trim()
      : KNOWLEDGE_SAMPLE_VIDEO_NAME;

  return { videoSource, videoName, questions };
}
