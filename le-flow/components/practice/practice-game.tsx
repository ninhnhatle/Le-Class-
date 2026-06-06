"use client";

import { useCallback, useEffect, useState } from "react";
import { GameCornerControls } from "@/components/ui/game-corner-controls";
import { Dialog } from "@/components/ui/dialog";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { PracticeSettingsDialog } from "@/components/practice/practice-settings-dialog";
import { SpinWheel } from "@/components/spin-wheel/spin-wheel";
import { useFullscreenContainer } from "@/hooks/use-fullscreen-container";
import {
  DEFAULT_PRACTICE_SETTINGS,
} from "@/lib/practice/constants";
import type { PracticeSettings } from "@/lib/practice/types";
import { checkPracticeAnswer, getRequiredAttempt, sanitizePracticeSettings } from "@/lib/practice/utils";
import { STEP_IDS } from "@/lib/step-settings/keys";
import {
  loadStepSettingsLocal,
  loadStepSettingsRemote,
  persistStepSettingsRemote,
} from "@/lib/step-settings/storage";

export function PracticeGame() {
  const [settings, setSettings] = useState<PracticeSettings>(() =>
    loadStepSettingsLocal(STEP_IDS.practice, {
      defaults: DEFAULT_PRACTICE_SETTINGS,
      sanitize: sanitizePracticeSettings,
    }),
  );
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
  const [showRewardWheel, setShowRewardWheel] = useState(false);
  const [answeredLocked, setAnsweredLocked] = useState(false);
  const [prizeResult, setPrizeResult] = useState<string | null>(null);

  const { containerRef, isFullscreen, portalContainer, toggleFullscreen } = useFullscreenContainer();

  useEffect(() => {
    void loadStepSettingsRemote(STEP_IDS.practice).then(({ settings: remote }) => {
      setSettings(remote);
    });
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    if (!isFullscreen) setSettingsOpen(false);
    if (isFullscreen) setShowRewardWheel(false);
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
    setShowRewardWheel(false);
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
    void persistStepSettingsRemote(STEP_IDS.practice, nextSettings);
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

  const progressPercent = questions.length > 0 ? ((questionIndex + 1) / questions.length) * 100 : 0;
  const optionLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const showQuestionPanel = !isFullscreen || !unlockedWheel || !showRewardWheel;
  const showWheelPanel = unlockedWheel && (!isFullscreen || showRewardWheel);
  const hideAnswersForRewardPrompt = isFullscreen && unlockedWheel && !showRewardWheel;

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
        className={`relative space-y-6 rounded-3xl ${
          isFullscreen
            ? `flex h-full min-h-screen flex-col bg-gradient-to-br from-violet-950 via-violet-900 to-fuchsia-950 p-6 sm:p-10 lg:p-14 ${
                showRewardWheel ? "items-center justify-center" : "justify-center"
              }`
            : "pt-12"
        }`}
      >
        <GameCornerControls
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenSettings={() => setSettingsOpen(true)}
          showSettings={!isFullscreen}
        />

        {!isFullscreen ? (
          <div className="overflow-hidden rounded-2xl border border-violet-200/60 bg-gradient-to-r from-violet-50/90 to-fuchsia-50/50 p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{settings.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{settings.subtitle}</p>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-violet-800 shadow-sm ring-1 ring-violet-100">
                {questions.length} câu hỏi
              </span>
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs font-medium text-violet-800/80">
                <span>Tiến độ</span>
                <span>
                  Câu {questionIndex + 1} / {questions.length}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : showQuestionPanel ? (
          <div className="mx-auto w-full max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-base font-semibold text-violet-100 backdrop-blur-sm sm:text-lg">
              Câu {questionIndex + 1} / {questions.length}
            </span>
            <div className="mx-auto mt-4 h-2 max-w-md overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-300 to-fuchsia-300 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : null}

        {showQuestionPanel ? (
        <div
          className={`mx-auto w-full border shadow-xl ${
            isFullscreen
              ? "max-w-5xl rounded-3xl border-white/10 bg-white p-8 sm:p-10 lg:p-14"
              : "rounded-2xl border-violet-100/80 bg-white p-6 shadow-md ring-1 ring-violet-50"
          }`}
        >
          {!isFullscreen ? (
            <div className="mb-5 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-sm font-bold text-violet-700">
                ?
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-700">Trả lời câu hỏi</h3>
            </div>
          ) : null}

          <RichTextContent
            html={question.promptHtml}
            className={
              isFullscreen
                ? "text-2xl font-bold leading-snug text-slate-900 sm:text-3xl lg:text-4xl [&_img]:my-4 [&_p]:leading-relaxed"
                : "text-base font-semibold text-slate-900 [&_p]:leading-snug"
            }
          />

          {!hideAnswersForRewardPrompt ? (
          <div className={isFullscreen ? "mt-8 space-y-4 sm:mt-10" : "mt-5 space-y-3"}>
            {question.type === "multiple_choice" ? (
              <ul className={isFullscreen ? "space-y-4" : "space-y-2"}>
                {(question.options ?? []).map((opt, i) => (
                  <li key={i}>
                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border transition ${
                        isFullscreen ? "px-6 py-5 sm:px-8 sm:py-6" : "px-4 py-3"
                      } ${
                        selectedIndex === i
                          ? "border-violet-400 bg-violet-50 ring-2 ring-violet-200"
                          : isFullscreen
                            ? "border-slate-200 bg-slate-50/90 hover:border-violet-300 hover:bg-violet-50/50"
                            : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
                      } ${answeredLocked ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <span
                        className={`flex shrink-0 items-center justify-center rounded-xl font-bold ${
                          isFullscreen ? "size-12 text-lg sm:size-14 sm:text-xl" : "size-8 text-sm"
                        } ${
                          selectedIndex === i
                            ? "bg-violet-600 text-white"
                            : "bg-white text-violet-700 ring-1 ring-violet-200"
                        }`}
                      >
                        {optionLetters[i] ?? i + 1}
                      </span>
                      <input
                        type="radio"
                        name={`practice-answer-${question.id}`}
                        className="sr-only"
                        checked={selectedIndex === i}
                        disabled={answeredLocked}
                        onChange={() => {
                          setSelectedIndex(i);
                          setWrongMessage(null);
                        }}
                      />
                      <span className={isFullscreen ? "text-lg font-medium text-slate-800 sm:text-xl lg:text-2xl" : "text-sm text-slate-800"}>
                        {opt}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : null}

            {question.type === "true_false" ? (
              <div className={`grid grid-cols-2 ${isFullscreen ? "gap-5" : "gap-3"}`}>
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
                    className={`rounded-2xl border font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isFullscreen ? "px-8 py-6 text-2xl sm:text-3xl" : "px-4 py-3 text-sm"
                    } ${
                      trueFalseChoice === value
                        ? "border-violet-400 bg-violet-50 text-violet-900 ring-2 ring-violet-200"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-300 hover:bg-violet-50/50"
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
                className={`w-full rounded-2xl border border-slate-200 bg-white text-slate-900 outline-none ring-violet-200 focus:border-violet-400 focus:ring-2 disabled:bg-slate-50 ${
                  isFullscreen ? "px-6 py-5 text-xl sm:text-2xl lg:text-3xl" : "px-4 py-3 text-sm"
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !answeredLocked && !unlockedWheel) submit();
                }}
              />
            ) : null}
          </div>
          ) : null}

          {wrongMessage ? (
            <p
              className={`mt-4 font-semibold text-rose-600 ${isFullscreen ? "text-lg sm:text-xl" : "text-sm"}`}
              role="alert"
            >
              {wrongMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p
              className={`mt-4 font-semibold text-emerald-700 ${isFullscreen ? "text-lg sm:text-xl" : "text-sm"}`}
              role="status"
            >
              {successMessage}
            </p>
          ) : null}

          {showExplanation && question.explanationHtml.trim() && !hideAnswersForRewardPrompt ? (
            <div
              className={`mt-5 rounded-2xl border border-sky-100 bg-sky-50/80 ${
                isFullscreen ? "px-6 py-5 sm:px-8 sm:py-6" : "px-4 py-3"
              }`}
            >
              <p className={`font-semibold uppercase tracking-wide text-sky-700 ${isFullscreen ? "text-sm" : "text-xs"}`}>
                Giải thích
              </p>
              <RichTextContent
                html={question.explanationHtml}
                className={isFullscreen ? "mt-3 text-base sm:text-lg [&_p]:leading-relaxed" : "mt-2"}
              />
            </div>
          ) : null}

          {!answeredLocked && !unlockedWheel ? (
            <button
              type="button"
              onClick={submit}
              className={`mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-700 hover:to-fuchsia-700 ${
                isFullscreen ? "py-5 text-xl sm:text-2xl" : "py-3 text-sm"
              }`}
            >
              Kiểm tra đáp án
            </button>
          ) : null}

          {unlockedWheel && isFullscreen && !showRewardWheel ? (
            <button
              type="button"
              onClick={() => setShowRewardWheel(true)}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-5 text-xl font-bold text-white shadow-lg shadow-amber-500/30 transition hover:from-amber-600 hover:to-orange-600 sm:text-2xl"
            >
              Nhận thưởng
            </button>
          ) : null}
        </div>
        ) : null}

        {showWheelPanel ? (
          <div
            className={`mx-auto w-full border shadow-xl ${
              isFullscreen
                ? "flex max-w-5xl flex-1 flex-col items-center justify-center rounded-3xl border-white/10 bg-white/95 p-6 sm:p-8"
                : "rounded-2xl border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-fuchsia-50/40 p-6 shadow-sm"
            }`}
          >
            <div className={`mb-6 text-center ${isFullscreen ? "sm:mb-4" : "sm:text-left"}`}>
              <h3 className={`font-bold text-slate-900 ${isFullscreen ? "text-2xl sm:text-3xl" : "text-base"}`}>
                Vòng quay phần quà
              </h3>
              <p className={`mt-1 text-slate-600 ${isFullscreen ? "text-base sm:text-lg" : "text-sm"}`}>
                Quay để nhận phần thưởng cho câu trả lời đúng.
              </p>
            </div>
            <SpinWheel
              key={`wheel-${questionIndex}-${sessionKey}`}
              options={settings.prizeOptions}
              hideInlineResult
              onResult={setPrizeResult}
              className={isFullscreen ? "w-full" : ""}
            />
            {!isLastQuestion ? (
              <button
                type="button"
                onClick={goToNextQuestion}
                className={`mt-6 w-full rounded-2xl border border-slate-200 bg-white font-semibold text-slate-700 transition hover:bg-slate-50 ${
                  isFullscreen ? "py-4 text-lg" : "py-3 text-sm"
                }`}
              >
                Câu hỏi tiếp theo
              </button>
            ) : (
              <p className={`mt-6 text-center text-slate-600 ${isFullscreen ? "text-lg" : "text-sm"}`}>
                Bạn đã hoàn thành tất cả câu hỏi.
              </p>
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
