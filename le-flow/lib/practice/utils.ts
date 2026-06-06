import { checkAnswer } from "@/lib/interactive-video/utils";
import type { VideoQuestion } from "@/lib/interactive-video/types";
import {
  DEFAULT_PRACTICE_SETTINGS,
  DEFAULT_PRIZE_OPTIONS,
  DEFAULT_PRACTICE_QUESTIONS,
} from "./constants";
import type { PracticeQuestion, PracticeSettings } from "./types";

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function toCheckableQuestion(question: PracticeQuestion): VideoQuestion {
  return {
    id: question.id,
    timeSeconds: 0,
    type: question.type,
    prompt: stripHtml(question.promptHtml),
    options: question.options,
    correctIndex: question.correctIndex,
    correctTrueFalse: question.correctTrueFalse,
    acceptedAnswers: question.acceptedAnswers,
  };
}

export function checkPracticeAnswer(question: PracticeQuestion, answer: string | number | boolean): boolean {
  return checkAnswer(toCheckableQuestion(question), answer);
}

export function getRequiredAttempt(question: PracticeQuestion, settings: PracticeSettings): number {
  const n = question.requiredAttemptToUnlock ?? settings.requiredAttemptToUnlock;
  return Math.max(1, Math.floor(n));
}

export function sanitizePracticeSettings(input: Partial<PracticeSettings> | null | undefined): PracticeSettings {
  if (!input) return DEFAULT_PRACTICE_SETTINGS;

  const questions = Array.isArray(input.questions)
    ? input.questions
        .filter((q): q is PracticeQuestion => Boolean(q && typeof q === "object" && typeof q.id === "string"))
        .map((q) => ({
          id: q.id,
          type: q.type === "true_false" || q.type === "free_text" ? q.type : "multiple_choice",
          promptHtml: typeof q.promptHtml === "string" ? q.promptHtml : "",
          explanationHtml: typeof q.explanationHtml === "string" ? q.explanationHtml : "",
          options: Array.isArray(q.options) ? q.options.map(String) : undefined,
          correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
          correctTrueFalse: typeof q.correctTrueFalse === "boolean" ? q.correctTrueFalse : true,
          acceptedAnswers: Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers.map(String) : undefined,
          requiredAttemptToUnlock:
            typeof q.requiredAttemptToUnlock === "number" && q.requiredAttemptToUnlock >= 1
              ? Math.floor(q.requiredAttemptToUnlock)
              : undefined,
        }))
    : DEFAULT_PRACTICE_QUESTIONS;

  const prizeOptions = Array.isArray(input.prizeOptions)
    ? input.prizeOptions.map((p) => String(p).trim()).filter(Boolean)
    : DEFAULT_PRIZE_OPTIONS;

  const allowMultipleAttempts = input.allowMultipleAttempts !== false;
  const requiredAttemptToUnlock = allowMultipleAttempts
    ? typeof input.requiredAttemptToUnlock === "number" && input.requiredAttemptToUnlock >= 1
      ? Math.floor(input.requiredAttemptToUnlock)
      : DEFAULT_PRACTICE_SETTINGS.requiredAttemptToUnlock
    : 1;

  return {
    title: (input.title ?? "").trim() || DEFAULT_PRACTICE_SETTINGS.title,
    subtitle: (input.subtitle ?? "").trim() || DEFAULT_PRACTICE_SETTINGS.subtitle,
    allowMultipleAttempts,
    requiredAttemptToUnlock,
    questions: questions.length > 0 ? questions : DEFAULT_PRACTICE_QUESTIONS,
    prizeOptions: prizeOptions.length >= 2 ? prizeOptions : DEFAULT_PRIZE_OPTIONS,
  } as any;
}
