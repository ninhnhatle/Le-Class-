"use client";

import { PracticeGame } from "@/components/practice/practice-game";

export function PracticeTabContent() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-violet-200/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-4 left-1/4 size-20 rounded-full bg-fuchsia-200/25 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-700/80">Giai đoạn 3</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Luyện tập có thưởng</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                Học sinh trả lời câu hỏi, nhận phản hồi ngay và quay vòng quay phần quà khi trả lời đúng.
              </p>
            </div>
          </div>
          <span className="w-fit shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">
            10–20 phút
          </span>
        </div>
      </div>

      <PracticeGame />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-violet-700">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-wide">Loại câu hỏi</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Trắc nghiệm, đúng/sai, điền từ — kèm giải thích và quy tắc số lần thử trước khi mở quà.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-wide">Mẹo giảng dạy</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Dùng full screen khi chiếu lớp — câu hỏi và đáp án sẽ phóng to, dễ đọc từ xa.
          </p>
        </div>
      </div>
    </div>
  );
}
