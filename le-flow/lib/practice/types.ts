import type { QuestionType } from "@/lib/interactive-video/types";

export type PracticeQuestion = {
  id: string;
  type: QuestionType;
  promptHtml: string;
  explanationHtml: string;
  options?: string[];
  correctIndex?: number;
  correctTrueFalse?: boolean;
  acceptedAnswers?: string[];
  /** Override global N for this question. */
  requiredAttemptToUnlock?: number;
};

export type PracticeSettings = {
  title: string;
  subtitle: string;
  allowMultipleAttempts: boolean;
  /** Wheel unlocks when answering correctly on attempt N (N >= 1). */
  requiredAttemptToUnlock: number;
  questions: PracticeQuestion[];
  prizeOptions: string[];
};
