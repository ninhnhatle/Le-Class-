"use client";

import { useState } from "react";
import { checkAnswer, formatTime } from "@/lib/interactive-video/utils";
import type { VideoQuestion } from "@/lib/interactive-video/types";

type QuestionOverlayProps = {
  question: VideoQuestion;
  onCorrect: () => void;
  fullscreen?: boolean;
};

export function QuestionOverlay({ question, onCorrect, fullscreen }: QuestionOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [trueFalseChoice, setTrueFalseChoice] = useState<boolean | null>(null);
  const [freeText, setFreeText] = useState("");
  const [wrongMessage, setWrongMessage] = useState<string | null>(null);

  const resetWrong = () => setWrongMessage(null);

  const submit = () => {
    let answer: string | number | boolean;
    if (question.type === "multiple_choice") {
      if (selectedIndex === null) {
        setWrongMessage("Vui lòng chọn một đáp án.");
        return;
      }
      answer = selectedIndex;
    } else if (question.type === "true_false") {
      if (trueFalseChoice === null) {
        setWrongMessage("Vui lòng chọn Đúng hoặc Sai.");
        return;
      }
      answer = trueFalseChoice;
    } else {
      if (!freeText.trim()) {
        setWrongMessage("Vui lòng nhập câu trả lời.");
        return;
      }
      answer = freeText;
    }

    if (checkAnswer(question, answer)) {
      onCorrect();
      return;
    }
    setWrongMessage("Chưa đúng. Hãy thử lại để tiếp tục xem video.");
  };

  return (
    <div
      className={`question-overlay-layer pointer-events-auto absolute inset-0 z-[100] flex h-full w-full items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm ${
        fullscreen ? "p-6 sm:p-10" : ""
      }`}
      style={{ isolation: "isolate" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-question-title"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border border-white/10 bg-white p-5 shadow-2xl sm:p-6 ${
          fullscreen ? "max-w-xl" : ""
        }`}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-sky-600">
          Câu hỏi tại {formatTime(question.timeSeconds)}
        </p>
        <h3 id="video-question-title" className="mt-2 text-base font-semibold leading-snug text-slate-900 sm:text-lg">
          {question.prompt}
        </h3>

        <div className="mt-4 space-y-3">
          {question.type === "multiple_choice" ? (
            <ul className="space-y-2">
              {(question.options ?? []).map((opt, i) => (
                <li key={i}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                      selectedIndex === i
                        ? "border-sky-400 bg-sky-50 ring-1 ring-sky-200"
                        : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`answer-${question.id}`}
                      className="mt-1 size-4 shrink-0 accent-sky-600"
                      checked={selectedIndex === i}
                      onChange={() => {
                        setSelectedIndex(i);
                        resetWrong();
                      }}
                    />
                    <span className="text-sm text-slate-800">{opt || `Đáp án ${i + 1}`}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : null}

          {question.type === "true_false" ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, label: "Đúng" },
                { value: false, label: "Sai" },
              ].map(({ value, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setTrueFalseChoice(value);
                    resetWrong();
                  }}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    trueFalseChoice === value
                      ? "border-sky-400 bg-sky-50 text-sky-900 ring-1 ring-sky-200"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          {question.type === "free_text" ? (
            <input
              type="text"
              value={freeText}
              onChange={(e) => {
                setFreeText(e.target.value);
                resetWrong();
              }}
              placeholder="Nhập câu trả lời của bạn..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-sky-200 focus:border-sky-400 focus:ring-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          ) : null}
        </div>

        {wrongMessage ? (
          <p className="mt-3 text-sm font-medium text-rose-600" role="alert">
            {wrongMessage}
          </p>
        ) : null}

        <button
          type="button"
          onClick={submit}
          className="mt-5 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Kiểm tra và tiếp tục
        </button>
      </div>
    </div>
  );
}
