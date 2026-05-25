import type { QuestionType, VideoQuestion } from "./types";

export function createQuestionId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Parses MM:SS or HH:MM:SS into seconds. Returns null if invalid. */
export function parseTimeInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(":").map((p) => p.trim());
  if (parts.some((p) => p === "" || Number.isNaN(Number(p)))) return null;

  const nums = parts.map(Number);
  if (nums.some((n) => n < 0 || !Number.isFinite(n))) return null;

  if (parts.length === 2) {
    const [mm, ss] = nums;
    if (ss >= 60) return null;
    return mm * 60 + ss;
  }

  if (parts.length === 3) {
    const [hh, mm, ss] = nums;
    if (mm >= 60 || ss >= 60) return null;
    return hh * 3600 + mm * 60 + ss;
  }

  return null;
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (hh > 0) {
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function normalizeTextAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function checkAnswer(question: VideoQuestion, answer: string | number | boolean): boolean {
  switch (question.type) {
    case "multiple_choice": {
      if (typeof answer !== "number") return false;
      return answer === question.correctIndex;
    }
    case "true_false": {
      if (typeof answer !== "boolean") return false;
      return answer === question.correctTrueFalse;
    }
    case "free_text": {
      if (typeof answer !== "string") return false;
      const normalized = normalizeTextAnswer(answer);
      const accepted = (question.acceptedAnswers ?? []).map(normalizeTextAnswer).filter(Boolean);
      return accepted.includes(normalized);
    }
    default:
      return false;
  }
}

export function createEmptyQuestion(type: QuestionType = "multiple_choice"): VideoQuestion {
  return {
    id: createQuestionId(),
    timeSeconds: 20,
    type,
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    correctTrueFalse: true,
    acceptedAnswers: [""],
  };
}

export function sortQuestionsByTime(questions: VideoQuestion[]): VideoQuestion[] {
  return [...questions].sort((a, b) => a.timeSeconds - b.timeSeconds);
}

export function createQuestionAtTime(timeSeconds: number, type: QuestionType = "multiple_choice"): VideoQuestion {
  const q = createEmptyQuestion(type);
  q.timeSeconds = Math.max(0, Math.round(timeSeconds * 10) / 10);
  return q;
}

/** Next unanswered question strictly after current playback time. */
export function getNextUnansweredQuestion(
  questions: VideoQuestion[],
  currentTime: number,
  answeredIds: Set<string>,
): VideoQuestion | null {
  return (
    sortQuestionsByTime(questions).find(
      (q) => !answeredIds.has(q.id) && q.timeSeconds > currentTime + 0.05,
    ) ?? null
  );
}

export const NEXT_QUESTION_HINT_SECONDS = 3;

export function secondsUntilQuestion(currentTime: number, questionTime: number): number {
  return Math.max(0, Math.ceil(questionTime - currentTime));
}

export function shouldShowNextQuestionHint(currentTime: number, questionTime: number): boolean {
  const remaining = questionTime - currentTime;
  return remaining > 0 && remaining <= NEXT_QUESTION_HINT_SECONDS;
}
