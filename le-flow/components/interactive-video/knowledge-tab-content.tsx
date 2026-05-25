"use client";

import { InteractiveVideoGame } from "./interactive-video-game";

export function KnowledgeTabContent() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Mục tiêu giai đoạn</h3>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Giới thiệu khái niệm mới qua video có tương tác: học sinh xem, trả lời câu hỏi đúng lúc mới được tiếp tục — giúp
          giữ sự tập trung và kiểm tra hiểu bài ngay trong tiết.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-indigo-50/40 p-6 shadow-sm">
        <InteractiveVideoGame />
      </div>
    </div>
  );
}
