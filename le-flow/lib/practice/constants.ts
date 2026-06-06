import { createQuestionId } from "@/lib/interactive-video/utils";
import { getStepSettingsKey, STEP_IDS } from "@/lib/step-settings/keys";
import type { PracticeQuestion, PracticeSettings } from "./types";

export const PRACTICE_SETTINGS_STORAGE_KEY = getStepSettingsKey(STEP_IDS.practice);

export const DEFAULT_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: "practice-1",
    type: "multiple_choice",
    promptHtml: "<p>Từ tiếng Nhật nào có nghĩa là <strong>“Xin chào”</strong>?</p>",
    explanationHtml: "<p><strong>こんにちは</strong> (konnichiwa) dùng để chào ban ngày.</p>",
    options: ["ありがとう", "こんにちは", "さようなら", "おはよう"],
    correctIndex: 1,
  },
  {
    id: "practice-2",
    type: "true_false",
    promptHtml: "<p>「ありがとう」 dùng để cảm ơn.</p>",
    explanationHtml: "<p>Đúng — <strong>ありがとう</strong> (arigatou) nghĩa là cảm ơn.</p>",
    correctTrueFalse: true,
  },
  {
    id: "practice-3",
    type: "free_text",
    promptHtml: "<p>Viết hiragana của từ <em>arigatou</em> (cảm ơn).</p>",
    explanationHtml: "<p>Đáp án: <strong>ありがとう</strong></p>",
    acceptedAnswers: ["ありがとう", "arigatou"],
  },
];

export const DEFAULT_PRIZE_OPTIONS = [
  "Sticker ngôi sao",
  "+2 điểm cộng",
  "Miễn 1 câu hỏi",
  "Chọn bài hát lớp",
  "Quyền trả lời trước",
  "Kẹo / quà nhỏ",
];

export const DEFAULT_PRACTICE_SETTINGS: PracticeSettings = {
  title: "Luyện tập có thưởng",
  subtitle: "Trả lời đúng để quay vòng quay nhận phần quà.",
  allowMultipleAttempts: true,
  requiredAttemptToUnlock: 1,
  questions: DEFAULT_PRACTICE_QUESTIONS,
  prizeOptions: DEFAULT_PRIZE_OPTIONS,
};

export function createEmptyPracticeQuestion(type: PracticeQuestion["type"] = "multiple_choice"): PracticeQuestion {
  return {
    id: createQuestionId(),
    type,
    promptHtml: "",
    explanationHtml: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    correctTrueFalse: true,
    acceptedAnswers: [""],
  };
}
