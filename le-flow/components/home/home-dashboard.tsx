"use client";

import { useState } from "react";
import { KnowledgeTabContent } from "@/components/interactive-video/knowledge-tab-content";
import { WarmupTabContent } from "@/components/warmup/warmup-tab-content";

type TabId = "warmup" | "knowledge" | "practice" | "application";

const tabs: {
  id: TabId;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "warmup",
    label: "Khởi động",
    description: "Kích thích hứng thú, ôn tập nhanh, dẫn nhập chủ đề.",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    id: "knowledge",
    label: "Hình thành kiến thức",
    description: "Giới thiệu khái niệm mới, minh họa và giải thích có cấu trúc.",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    id: "practice",
    label: "Luyện tập",
    description: "Bài tập có hướng dẫn, kiểm tra nhanh, phản hồi tức thì.",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    id: "application",
    label: "Vận dụng",
    description: "Tình huống thực tế, dự án nhỏ, kết nối bài học với đời sống.",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
];

function TabPanel({ id }: { id: TabId }) {
  const panels: Record<TabId, React.ReactNode> = {
    warmup: <WarmupTabContent />,
    knowledge: <KnowledgeTabContent />,
    practice: (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Cấu trúc luyện tập</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { title: "Cá nhân", detail: "Bài tập viết / chọn đáp án" },
              { title: "Cặp đôi", detail: "Hỏi — đáp theo mẫu câu" },
              { title: "Nhóm nhỏ", detail: "Hoàn thành nhiệm vụ chung" },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                <p className="mt-1 text-xs text-slate-600">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Luân phiên độ khó: từ nhận diện mẫu → sản xuất ngôn ngữ đơn giản → mở rộng ngữ cảnh.
        </p>
      </div>
    ),
    application: (
      <div className="space-y-6">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800/80">Vận dụng thực tế</h3>
          <p className="mt-2 text-slate-800 leading-relaxed">
            Thiết kế tình huống gần gũi với học sinh: phỏng vấn giả lập, thư/email mẫu, kịch bản hội thoại tại cửa hàng hoặc trường học.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Tiêu chí đánh giá nhanh</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              Phù hợp ngữ cảnh và vai trò giao tiếp.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              Sử dụng đúng cấu trúc / từ vựng đã học.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              Thái độ tự tin, có tương tác với bạn.
            </li>
          </ul>
        </div>
      </div>
    ),
  };

  return <div>{panels[id]}</div>;
}

export function HomeDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("warmup");
  const current = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="mx-auto max-w-4xl">
      <div
        role="tablist"
        aria-label="Các bước thiết kế bài dạy"
        className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm sm:flex-row sm:flex-wrap sm:gap-1"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all sm:min-w-0 sm:flex-1 ${
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/15 ring-1 ring-slate-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                  isActive ? "bg-white/15 text-sky-200" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.icon}
              </span>
              <span className="min-w-0 leading-snug">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-sky-200 shadow-inner">
              {current.icon}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{current.label}</h2>
              <p className="text-sm text-slate-500">{current.description}</p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Bước {tabs.findIndex((t) => t.id === activeTab) + 1} / 4
          </span>
        </div>

        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="pt-6">
          <TabPanel id={activeTab} />
        </div>
      </div>
    </div>
  );
}
