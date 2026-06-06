"use client";

import { PracticeGame } from "@/components/practice/practice-game";

export function PracticeTabContent() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Mục tiêu giai đoạn</h3>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Củng cố kiến thức qua bài tập có phản hồi, khuyến khích học sinh tự giải quyết vấn đề và nhận thưởng khi trả lời đúng.
        </p>
      </div>

      <PracticeGame />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-violet-50/80 p-5 ring-1 ring-violet-100">
          <p className="text-xs font-medium text-violet-800/90">Gợi ý hoạt động</p>
          <p className="mt-2 text-sm text-violet-950/80">Câu hỏi trắc nghiệm, đúng/sai, điền từ — trả lời đúng để quay phần quà.</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-100">
          <p className="text-xs font-medium text-slate-600">Thời lượng gợi ý</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">10–20 phút</p>
        </div>
      </div>
    </div>
  );
}
