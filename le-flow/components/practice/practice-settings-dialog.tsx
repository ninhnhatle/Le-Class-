"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Dialog } from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { QUESTION_TYPE_LABELS } from "@/lib/interactive-video/types";
import type { QuestionType } from "@/lib/interactive-video/types";
import { createEmptyPracticeQuestion, DEFAULT_PRACTICE_SETTINGS } from "@/lib/practice/constants";
import type { PracticeQuestion, PracticeSettings } from "@/lib/practice/types";
import { sanitizePracticeSettings, stripHtml } from "@/lib/practice/utils";

type PracticeSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  settings: PracticeSettings;
  onSave: (settings: PracticeSettings) => void;
};

type SettingsTab = "wheel" | "questions";

const FIELD_INPUT =
  "w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-base text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10";
const FIELD_LABEL = "mb-2 block text-base font-medium text-slate-700";

function reorderQuestions(
  questions: PracticeQuestion[],
  draggedId: string,
  targetId: string,
): PracticeQuestion[] {
  const fromIndex = questions.findIndex((q) => q.id === draggedId);
  const toIndex = questions.findIndex((q) => q.id === targetId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return questions;

  const next = [...questions];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function QuestionEditor({
  index,
  question,
  expanded,
  onExpandedChange,
  onChange,
  onRemove,
  isDragging = false,
  onDragHandleStart,
  onDragHandleEnd,
}: {
  index: number;
  question: PracticeQuestion;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onChange: (next: PracticeQuestion) => void;
  onRemove: () => void;
  isDragging?: boolean;
  onDragHandleStart: () => void;
  onDragHandleEnd: () => void;
}) {
  const updateType = (type: QuestionType) => {
    const base = createEmptyPracticeQuestion(type);
    onChange({ ...base, id: question.id, promptHtml: question.promptHtml, explanationHtml: question.explanationHtml });
  };

  const preview =
    stripHtml(question.promptHtml) ||
    (question.type === "free_text"
      ? "Câu hỏi tự do"
      : question.type === "true_false"
        ? "Câu hỏi đúng / sai"
        : "Chưa có nội dung câu hỏi");

  return (
    <article
      className={`overflow-hidden rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50/90 via-white to-violet-50/40 shadow-md shadow-sky-100/60 ring-1 ring-sky-100 transition-opacity ${
        isDragging ? "opacity-45" : ""
      }`}
    >
      <header
        className={`flex flex-wrap items-center justify-between gap-3 bg-sky-100/50 px-5 py-4 ${
          expanded ? "border-b border-sky-100" : ""
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", question.id);
              onDragHandleStart();
            }}
            onDragEnd={onDragHandleEnd}
            title="Kéo để sắp xếp"
            aria-label="Kéo để sắp xếp thứ tự câu hỏi"
            className="flex size-9 shrink-0 cursor-grab items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm active:cursor-grabbing hover:border-sky-200 hover:text-sky-600"
          >
            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <circle cx="7" cy="5" r="1.25" />
              <circle cx="13" cy="5" r="1.25" />
              <circle cx="7" cy="10" r="1.25" />
              <circle cx="13" cy="10" r="1.25" />
              <circle cx="7" cy="15" r="1.25" />
              <circle cx="13" cy="15" r="1.25" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => onExpandedChange(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? "Thu gọn câu hỏi" : "Mở rộng câu hỏi"}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-white text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
          >
            <svg
              className={`size-5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <span className="shrink-0 rounded-full bg-sky-600 px-3.5 py-1 text-sm font-bold text-white shadow-sm">
            Câu {index + 1}
          </span>
          {expanded ? (
            <select
              value={question.type}
              onChange={(e) => updateType(e.target.value as QuestionType)}
              className={`${FIELD_INPUT} w-auto bg-white py-2`}
            >
              {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
                <option key={type} value={type}>
                  {QUESTION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          ) : (
            <span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-sky-100">
              {QUESTION_TYPE_LABELS[question.type]}
            </span>
          )}
          {!expanded ? (
            <p className="min-w-0 truncate text-base text-slate-600" title={preview}>
              {preview}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
        >
          Xóa câu hỏi
        </button>
      </header>

      {expanded ? (
      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="rounded-xl border border-sky-100 bg-white/80 p-4 shadow-sm">
            <label className={FIELD_LABEL}>Nội dung câu hỏi</label>
            <RichTextEditor
              value={question.promptHtml}
              onChange={(promptHtml) => onChange({ ...question, promptHtml })}
              placeholder="Nhập câu hỏi..."
              minHeight="11rem"
              allowImages
              size="lg"
            />
          </div>

          {question.type === "multiple_choice" ? (
            <div className="space-y-2.5 rounded-xl border border-slate-100 bg-white/80 p-4">
              <p className="text-base font-medium text-slate-700">Các đáp án</p>
              {(question.options ?? []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctIndex === i}
                    onChange={() => onChange({ ...question, correctIndex: i })}
                    className="size-4 accent-sky-600"
                    aria-label={`Đáp án đúng ${i + 1}`}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const options = [...(question.options ?? [])];
                      options[i] = e.target.value;
                      onChange({ ...question, options });
                    }}
                    className={`min-w-0 flex-1 ${FIELD_INPUT}`}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {question.type === "true_false" ? (
            <div className="flex gap-3">
              {[
                { value: true, label: "Đúng" },
                { value: false, label: "Sai" },
              ].map(({ value, label }) => (
                <label
                  key={label}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-medium"
                >
                  <input
                    type="radio"
                    name={`tf-${question.id}`}
                    checked={question.correctTrueFalse === value}
                    onChange={() => onChange({ ...question, correctTrueFalse: value })}
                    className="accent-sky-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          ) : null}

          {question.type === "free_text" ? (
            <div className="rounded-xl border border-slate-100 bg-white/80 p-4">
              <label className={FIELD_LABEL}>Đáp án chấp nhận (mỗi dòng một đáp án)</label>
              <textarea
                rows={4}
                value={(question.acceptedAnswers ?? []).join("\n")}
                onChange={(e) =>
                  onChange({
                    ...question,
                    acceptedAnswers: e.target.value.split(/\r?\n/).map((line) => line.trim()),
                  })
                }
                className={FIELD_INPUT}
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-violet-100 bg-white/80 p-4 shadow-sm">
            <label className={FIELD_LABEL}>Giải thích đáp án</label>
            <RichTextEditor
              value={question.explanationHtml}
              onChange={(explanationHtml) => onChange({ ...question, explanationHtml })}
              placeholder="Giải thích hiển thị sau khi trả lời..."
              minHeight="11rem"
              size="lg"
            />
          </div>

          <div className="rounded-xl border border-slate-100 bg-white/80 p-4">
            <label className={FIELD_LABEL}>
              Lần trả lời đúng thứ N để mở quà (để trống = dùng cài đặt chung)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={question.requiredAttemptToUnlock ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                onChange({
                  ...question,
                  requiredAttemptToUnlock: raw === "" ? undefined : Math.max(1, Number(raw)),
                });
              }}
              placeholder={String(DEFAULT_PRACTICE_SETTINGS.requiredAttemptToUnlock)}
              className={FIELD_INPUT}
            />
          </div>
        </div>
      </div>
      ) : null}
    </article>
  );
}

function WheelSettingsPanel({
  draft,
  setDraft,
  newPrize,
  setNewPrize,
  onAddPrize,
}: {
  draft: PracticeSettings;
  setDraft: Dispatch<SetStateAction<PracticeSettings>>;
  newPrize: string;
  setNewPrize: (value: string) => void;
  onAddPrize: () => void;
}) {
  return (
    <div className="space-y-6 text-base">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={FIELD_LABEL}>Tiêu đề</label>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
            className={FIELD_INPUT}
          />
        </div>
        <div>
          <label className={FIELD_LABEL}>Mô tả</label>
          <input
            type="text"
            value={draft.subtitle}
            onChange={(e) => setDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
            className={FIELD_INPUT}
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-slate-800">Phần quà trên vòng quay</p>
          <span className="text-sm text-slate-500">Cần ít nhất 2 mục</span>
        </div>
        <ul className="space-y-2.5">
          {draft.prizeOptions.map((prize, index) => (
            <li key={index} className="flex gap-2">
              <input
                type="text"
                value={prize}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    prizeOptions: prev.prizeOptions.map((p, i) => (i === index ? e.target.value : p)),
                  }))
                }
                className={`min-w-0 flex-1 ${FIELD_INPUT}`}
              />
              <button
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    prizeOptions: prev.prizeOptions.filter((_, i) => i !== index),
                  }))
                }
                className="shrink-0 rounded-lg px-3.5 py-2.5 text-base text-rose-600 hover:bg-rose-50"
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newPrize}
            onChange={(e) => setNewPrize(e.target.value)}
            placeholder="Thêm phần quà..."
            className={`min-w-0 flex-1 ${FIELD_INPUT}`}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAddPrize();
            }}
          />
          <button type="button" onClick={onAddPrize} className="rounded-lg bg-sky-600 px-5 py-2.5 text-base font-medium text-white hover:bg-sky-500">
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionsSettingsPanel({
  draft,
  setDraft,
}: {
  draft: PracticeSettings;
  setDraft: Dispatch<SetStateAction<PracticeSettings>>;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(draft.questions.map((q) => q.id)),
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const expandAll = () => {
    setExpandedIds(new Set(draft.questions.map((q) => q.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const addQuestion = () => {
    const newQuestion = createEmptyPracticeQuestion();
    setDraft((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setExpandedIds((prev) => new Set([...prev, newQuestion.id]));
  };

  const removeQuestion = (index: number) => {
    const removedId = draft.questions[index]?.id;
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
    if (removedId) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(removedId);
        return next;
      });
    }
  };

  const allExpanded = draft.questions.length > 0 && draft.questions.every((q) => expandedIds.has(q.id));
  const allCollapsed = draft.questions.every((q) => !expandedIds.has(q.id));

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    setDraft((prev) => ({
      ...prev,
      questions: reorderQuestions(prev.questions, draggingId, targetId),
    }));
    setDraggingId(null);
    setDragOverId(null);
  };

  const clearDragState = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  return (
    <div className="space-y-6 text-base">
      <fieldset className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
        <legend className="px-1 text-base font-semibold text-slate-800">Quy tắc trả lời</legend>
        <label className="flex cursor-pointer items-start gap-3 text-base text-slate-700">
          <input
            type="checkbox"
            checked={draft.allowMultipleAttempts}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                allowMultipleAttempts: e.target.checked,
                requiredAttemptToUnlock: e.target.checked ? prev.requiredAttemptToUnlock : 1,
              }))
            }
            className="mt-1 size-4 rounded accent-sky-600"
          />
          <span>
            Cho phép trả lời nhiều lần
            <span className="mt-1 block text-sm text-slate-500">
              Tắt: mỗi câu chỉ trả lời một lần, sai sẽ chuyển câu tiếp theo.
            </span>
          </span>
        </label>
        <div className="mt-4 max-w-sm">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Lần trả lời đúng thứ N để mở vòng quay (N ≥ 1)
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={draft.requiredAttemptToUnlock}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                requiredAttemptToUnlock: Math.max(1, Number(e.target.value) || 1),
              }))
            }
            disabled={!draft.allowMultipleAttempts}
            className={`${FIELD_INPUT} disabled:bg-slate-50 disabled:text-slate-400`}
          />
          {!draft.allowMultipleAttempts ? (
            <p className="mt-1.5 text-sm text-slate-500">Khi không cho trả lời nhiều lần, chỉ N = 1.</p>
          ) : null}
        </div>
      </fieldset>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-slate-800">Danh sách câu hỏi</p>
            {draft.questions.length > 1 ? (
              <p className="mt-0.5 text-sm text-slate-500">Kéo biểu tượng ⋮⋮ để đổi thứ tự câu hỏi</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {draft.questions.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={expandAll}
                  disabled={allExpanded}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Mở rộng tất cả
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  disabled={allCollapsed}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Thu gọn tất cả
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={addQuestion}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Thêm câu hỏi
            </button>
          </div>
        </div>
        <div className="space-y-5">
          {draft.questions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-base text-slate-500">
              Chưa có câu hỏi. Bấm &quot;Thêm câu hỏi&quot; để bắt đầu.
            </p>
          ) : (
            draft.questions.map((question, index) => (
              <div
                key={question.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggingId && draggingId !== question.id) setDragOverId(question.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(question.id);
                }}
                className={`rounded-2xl transition ${
                  dragOverId === question.id && draggingId !== question.id
                    ? "ring-2 ring-sky-400 ring-offset-2"
                    : ""
                }`}
              >
                <QuestionEditor
                  index={index}
                  question={question}
                  expanded={expandedIds.has(question.id)}
                  isDragging={draggingId === question.id}
                  onDragHandleStart={() => setDraggingId(question.id)}
                  onDragHandleEnd={clearDragState}
                  onExpandedChange={(open) =>
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      if (open) next.add(question.id);
                      else next.delete(question.id);
                      return next;
                    })
                  }
                  onChange={(next) =>
                    setDraft((prev) => ({
                      ...prev,
                      questions: prev.questions.map((q, i) => (i === index ? next : q)),
                    }))
                  }
                  onRemove={() => removeQuestion(index)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function PracticeSettingsDialog({ open, onClose, settings, onSave }: PracticeSettingsDialogProps) {
  const [draft, setDraft] = useState(settings);
  const [activeTab, setActiveTab] = useState<SettingsTab>("wheel");
  const [newPrize, setNewPrize] = useState("");

  const handleSave = () => {
    onSave(sanitizePracticeSettings(draft));
  };

  const addPrize = () => {
    const value = newPrize.trim();
    if (!value) return;
    setDraft((prev) => ({ ...prev, prizeOptions: [...prev.prizeOptions, value] }));
    setNewPrize("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cài đặt luyện tập"
      description="Thiết lập vòng quay phần quà và câu hỏi luyện tập."
      size="2xl"
      preventOutsideClose
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg px-5 py-2.5 text-base font-medium text-slate-600 transition hover:bg-slate-100">
            Hủy
          </button>
          <button type="button" onClick={handleSave} className="rounded-lg bg-slate-900 px-5 py-2.5 text-base font-medium text-white transition hover:bg-slate-800">
            Lưu
          </button>
        </>
      }
    >
      <div
        role="tablist"
        aria-label="Cài đặt luyện tập"
        className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
      >
        {(
          [
            { id: "wheel" as const, label: "Vòng quay" },
            { id: "questions" as const, label: "Câu hỏi" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-3 text-base font-medium transition ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === "wheel" ? (
          <WheelSettingsPanel
            draft={draft}
            setDraft={setDraft}
            newPrize={newPrize}
            setNewPrize={setNewPrize}
            onAddPrize={addPrize}
          />
        ) : (
          <QuestionsSettingsPanel draft={draft} setDraft={setDraft} />
        )}
      </div>
    </Dialog>
  );
}
