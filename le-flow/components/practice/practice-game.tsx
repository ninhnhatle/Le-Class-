"use client";

import { useCallback, useState } from "react";
import { GameCornerControls } from "@/components/ui/game-corner-controls";
import { Dialog } from "@/components/ui/dialog";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { PracticeSettingsDialog } from "@/components/practice/practice-settings-dialog";
import { SpinWheel } from "@/components/spin-wheel/spin-wheel";
import { useFullscreenContainer } from "@/hooks/use-fullscreen-container";
import {
  DEFAULT_PRACTICE_SETTINGS,
  PRACTICE_SETTINGS_STORAGE_KEY,
} from "@/lib/practice/constants";
import type { PracticeSettings } from "@/lib/practice/types";
import { checkPracticeAnswer, getRequiredAttempt, sanitizePracticeSettings } from "@/lib/practice/utils";

function loadStoredSettings(): PracticeSettings {
  if (typeof window === "undefined") return DEFAULT_PRACTICE_SETTINGS;
  try {
    const raw = localStorage.getItem(PRACTICE_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_PRACTICE_SETTINGS;
    return sanitizePracticeSettings(JSON.parse(raw) as Partial<PracticeSettings>);
  } catch {
    return DEFAULT_PRACTICE_SETTINGS;
  }
}

export function PracticeGame() {
  const [settings, setSettings] = useState<PracticeSettings>(() => loadStoredSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [trueFalseChoice, setTrueFalseChoice] = useState<boolean | null>(null);
  const [freeText, setFreeText] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [wrongMessage, setWrongMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [unlockedWheel, setUnlockedWheel] = useState(false);
  const [answeredLocked, setAnsweredLocked] = useState(false);
  const [prizeResult, setPrizeResult] = useState<string | null>(null);

  const { containerRef, isFullscreen, portalContainer, toggleFullscreen } = useFullscreenContainer();

  const handleToggleFullscreen = useCallback(async () => {
    if (!isFullscreen) setSettingsOpen(false);
    await toggleFullscreen();
  }, [isFullscreen, toggleFullscreen]);

  const questions = settings.questions;
  const question = questions[questionIndex];
  const isLastQuestion = questionIndex >= questions.length - 1;
  const requiredN = question ? getRequiredAttempt(question, settings) : 1;

  const resetInputs = () => {
    setSelectedIndex(null);
    setTrueFalseChoice(null);
    setFreeText("");
    setWrongMessage(null);
    setSuccessMessage(null);
    setShowExplanation(false);
  };

  const resetQuestionState = () => {
    resetInputs();
    setAttemptCount(0);
    setUnlockedWheel(false);
    setAnsweredLocked(false);
    setPrizeResult(null);
  };

  const goToNextQuestion = () => {
    if (isLastQuestion) return;
    setQuestionIndex((prev) => prev + 1);
    resetQuestionState();
  };

  const saveSettings = (nextSettings: PracticeSettings) => {
    setSettings(nextSettings);
    localStorage.setItem(PRACTICE_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
    setSessionKey((prev) => prev + 1);
    setQuestionIndex(0);
    resetQuestionState();
    setSettingsOpen(false);
  };

  const submit = () => {
    if (!question || answeredLocked || unlockedWheel) return;

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

    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    setWrongMessage(null);

    const isCorrect = checkPracticeAnswer(question, answer);

    if (!isCorrect) {
      setShowExplanation(true);
      if (settings.allowMultipleAttempts) {
        setWrongMessage(`Chưa đúng. Lần thử ${nextAttempt}. Hãy thử lại!`);
        return;
      }
      setAnsweredLocked(true);
      setWrongMessage("Chưa đúng. Chuyển sang câu tiếp theo.");
      window.setTimeout(() => {
        if (!isLastQuestion) goToNextQuestion();
      }, 1800);
      return;
    }

    setShowExplanation(true);

    if (nextAttempt >= requiredN) {
      setUnlockedWheel(true);
      setAnsweredLocked(true);
      setSuccessMessage("Chính xác! Bạn được quay vòng quay để chọn phần quà.");
      return;
    }

    if (settings.allowMultipleAttempts) {
      setSuccessMessage(
        `Đúng rồi! Trả lời đúng ở lần thứ ${requiredN} để mở quà. (Hiện tại: lần ${nextAttempt})`,
      );
      setSelectedIndex(null);
      setTrueFalseChoice(null);
      setFreeText("");
      return;
    }

    setAnsweredLocked(true);
  };

  if (!question) {
    return (
      <>
        <div className="relative rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-fuchsia-50/40 p-6 pt-12 shadow-sm">
          <GameCornerControls
            isFullscreen={false}
            onToggleFullscreen={() => {}}
            showFullscreen={false}
            onOpenSettings={() => setSettingsOpen(true)}
          />
          <div>
            <h3 className="text-base font-semibold text-slate-900">{settings.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{settings.subtitle}</p>
          </div>
          <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-8 text-center text-sm text-slate-500">
            Chưa có câu hỏi. Mở cài đặt để thêm câu hỏi luyện tập.
          </p>
        </div>
        {settingsOpen ? (
          <PracticeSettingsDialog
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            settings={settings}
            onSave={saveSettings}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        key={sessionKey}
        className={`relative space-y-6 rounded-3xl ${isFullscreen ? "flex h-full min-h-screen flex-col justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 sm:p-10" : "pt-12"}`}
      >
        <GameCornerControls
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenSettings={() => setSettingsOpen(true)}
          showSettings={!isFullscreen}
        />

        <div>
          <h3 className="text-base font-semibold text-slate-900">{settings.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{settings.subtitle}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Trả lời câu hỏi</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Câu {questionIndex + 1} / {questions.length}
            </span>
          </div>

          <RichTextContent html={question.promptHtml} className="text-base font-semibold text-slate-900 [&_p]:leading-snug" />

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
                      } ${answeredLocked ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`practice-answer-${question.id}`}
                        className="mt-1 size-4 shrink-0 accent-sky-600"
                        checked={selectedIndex === i}
                        disabled={answeredLocked}
                        onChange={() => {
                          setSelectedIndex(i);
                          setWrongMessage(null);
                        }}
                      />
                      <span className="text-sm text-slate-800">{opt}</span>
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
                    disabled={answeredLocked}
                    onClick={() => {
                      setTrueFalseChoice(value);
                      setWrongMessage(null);
                    }}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
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
                disabled={answeredLocked}
                onChange={(e) => {
                  setFreeText(e.target.value);
                  setWrongMessage(null);
                }}
                placeholder="Nhập câu trả lời của bạn..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-sky-200 focus:border-sky-400 focus:ring-2 disabled:bg-slate-50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !answeredLocked && !unlockedWheel) submit();
                }}
              />
            ) : null}
          </div>

          {wrongMessage ? (
            <p className="mt-3 text-sm font-medium text-rose-600" role="alert">
              {wrongMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mt-3 text-sm font-medium text-emerald-700" role="status">
              {successMessage}
            </p>
          ) : null}

          {showExplanation && question.explanationHtml.trim() ? (
            <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Giải thích</p>
              <RichTextContent html={question.explanationHtml} className="mt-2" />
            </div>
          ) : null}

          {!answeredLocked && !unlockedWheel ? (
            <button
              type="button"
              onClick={submit}
              className="mt-5 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Kiểm tra đáp án
            </button>
          ) : null}
        </div>

        {unlockedWheel ? (
          <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-fuchsia-50/40 p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-slate-900">Vòng quay phần quà</h3>
              <p className="mt-1 text-sm text-slate-600">Quay để nhận phần thưởng cho câu trả lời đúng.</p>
            </div>
            <SpinWheel
              key={`wheel-${questionIndex}-${sessionKey}`}
              options={settings.prizeOptions}
              hideInlineResult
              onResult={setPrizeResult}
            />
            {!isLastQuestion ? (
              <button
                type="button"
                onClick={goToNextQuestion}
                className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Câu hỏi tiếp theo
              </button>
            ) : (
              <p className="mt-6 text-center text-sm text-slate-600">Bạn đã hoàn thành tất cả câu hỏi.</p>
            )}
          </div>
        ) : null}

        {prizeResult ? (
          <Dialog
            open
            onClose={() => setPrizeResult(null)}
            title="Phần quà của bạn"
            portalContainer={portalContainer ?? undefined}
            footer={
              <button
                type="button"
                onClick={() => setPrizeResult(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Đóng
              </button>
            }
          >
            <div className="text-center">
              <p className="text-sm text-slate-600">Chúc mừng! Bạn nhận được</p>
              <p className="mt-2 text-3xl font-bold text-violet-900">{prizeResult}</p>
            </div>
          </Dialog>
        ) : null}
      </div>

      {settingsOpen ? (
        <PracticeSettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          onSave={saveSettings}
        />
      ) : null}
    </>
  );
}
