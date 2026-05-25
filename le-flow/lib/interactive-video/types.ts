export type QuestionType = "multiple_choice" | "true_false" | "free_text";

export type VideoQuestion = {
  id: string;
  timeSeconds: number;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctTrueFalse?: boolean;
  acceptedAnswers?: string[];
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Trắc nghiệm",
  true_false: "Đúng / Sai",
  free_text: "Trả lời tự do",
};
